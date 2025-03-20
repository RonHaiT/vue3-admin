// 转换字符串格式
const toCamelCase = (str: string, upperFirst = true) => {
    return str
        .split('/')
        .map((segment, index) => {
            if (index === 0 && !upperFirst) {
                return segment.charAt(0).toLowerCase() + segment.slice(1) // 确保首字母小写
            } else {
                return segment.charAt(0).toUpperCase() + segment.slice(1) // 其他单词首字母大写
            }

        })
        .join('')
}

export default toCamelCase