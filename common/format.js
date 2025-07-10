exports.bold = (string) => {
    return "**" + string + "**";
}

exports.strikethrough = (string) => {
    return "~~" + string + "~~";
}

exports.codeBlock = (string, syntaxHighlighter) => {
    return (syntaxHighlighter ? ("```"+syntaxHighlighter+"\n") : "```") + string + "```";
}

exports.italic = (string) => {
    return "*" + string + "*";
}

// names = array of strings
exports.stringCommaList = (names) => {    
    return names.join(", ").replace(/,(?=[^,]*$)/, ' and');
}

exports.sentenceCase = (sentence) => {    
  return sentence.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}