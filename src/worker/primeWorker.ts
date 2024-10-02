function isPrime(num: number): boolean {
  if (num < 2) return false
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false
  }
  return true
}

function nthPrime(x: number): number {
  let count = 0
  let num = 1
  while (count < x) {
    num++
    if (isPrime(num)) {
      count++
    }
  }
  return num
}

self.onmessage = (event: MessageEvent) => {
  const { x } = event.data
  const result = nthPrime(x)
  self.postMessage({ result })
}
