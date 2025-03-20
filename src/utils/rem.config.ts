export default {
    // 如果你的设计稿宽度是 750px，并且你希望每 750px 对应 100rem，那么 rootValue 就应该是 750 / 100 = 7.5。
    // 如果设计稿宽度为 750px，每 750px 对应 20rem，则 rootValue 为 750 / 20 = 37.5
    //换算基数， 默认100 ,也就是1440px ，这样的话把根标签的字体规定为1rem为50px,这样就可以从设计稿上量出多少个px直接在代码中写多少px了
    rootValue: 32,
    unitPrecision: 5, //允许REM单位增长到的十进制数字，其实就是精度控制
    propWhiteList: [], // 默认值是一个空数组，这意味着禁用白名单并启用所有属性。
    propBlackList: [], // 黑名单
    exclude: /node_modules\/(tdesign|vant)|(\~\/assets\/css\/theme\.css$)/,//'~/assets/css/theme.css' 默认false，可以（reg）利用正则表达式排除某些文件夹的方法，例如 / (node_module) / 。如果想把前端UI框架内的px也转换成rem，请把此属性设为默认值
    selectorBlackList: ['ignore-'], //要忽略并保留为px的选择器 忽略的选择器前缀
    ignoreIdentifier: false, //（boolean/string）忽略单个属性的方法，启用ignoreidentifier后，replace将自动设置为true。
    replace: true, // （布尔值）替换包含REM的规则，而不是添加回退。
    mediaQuery: true, //（布尔值）允许在媒体查询中转换px
    minPixelValue: 0, //设置要替换的最小像素值(3px会被转rem)。 默认 0
}