parse_git_branch() {
    git branch 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/ (\1)/'
}

if [ "$color_prompt" = yes ]; then
    PS1="\n"
    PS1+="\[\e[32m\]\u"
    PS1+="\[\e[30m\]@"
    PS1+="\[\e[33m\]\h "
    PS1+="\[\e[34m\]\w"
    PS1+="\[\e[35m\]\$(parse_git_branch)"
    PS1+="\n"
    PS1+="\[\e[30m\]\$ "
    PS1+="\[\e[0m\]"
else
    PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi
unset color_prompt force_color_prompt
