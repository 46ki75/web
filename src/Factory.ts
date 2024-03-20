import { NotionClient } from 'notion-markup-utils'

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

class ParameterStore {
  private readonly client: SSMClient
  private readonly cache: Map<string, { value: string; expiry: number }>
  private static instance: ParameterStore

  private constructor() {
    this.client = new SSMClient({ region: 'ap-northeast-1' })
    this.cache = new Map()
  }

  public static getInstance(): ParameterStore {
    if (ParameterStore.instance == null) {
      ParameterStore.instance = new ParameterStore()
    }
    return ParameterStore.instance
  }

  async get(
    parameterName: string,
    cacheDuration = 5 * 60 * 1000
  ): Promise<string> {
    const now = Date.now()
    const cached = this.cache.get(parameterName)

    if (cached != null && cached.expiry > now) {
      return cached.value
    }

    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true
    })

    try {
      const response = await this.client.send(command)
      if (response.Parameter?.Value != null) {
        const value = response.Parameter.Value
        this.cache.set(parameterName, { value, expiry: now + cacheDuration })
        return value
      } else {
        throw new Error('Parameter not found or has no value')
      }
    } catch (error) {
      console.error('Error fetching parameter:', error)
      throw error
    }
  }
}

export class Factory {
  private notionClient: NotionClient | null
  private blogDBID: string | null
  private readonly parameterStore: ParameterStore = ParameterStore.getInstance()

  constructor() {
    this.notionClient = null
    this.blogDBID = null
  }

  async getParameter(name: string): Promise<string> {
    return await this.parameterStore.get(name)
  }

  async getNotionClient(): Promise<NotionClient> {
    if (this.notionClient != null) return this.notionClient

    this.notionClient = new NotionClient({
      NOTION_API_KEY: await this.getParameter(
        `/blog/web/${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}/notion/default/secret`
      )
    })

    return this.notionClient
  }

  async getBlogDBID(): Promise<string> {
    if (this.blogDBID != null) return this.blogDBID

    this.blogDBID = await this.getParameter(
      '/blog/web/common/notion/database/blog/id'
    )

    return this.blogDBID
  }
}

export const factory = new Factory()
