// 规则集通用配置
const ruleProviderCommon = {
  "interval": 86400,
  "proxy": "DIRECT",
  "type": "http",
  "format": "mrs",
};

// 策略组通用配置
const groupBaseOption = {
  "interval": 300,
  "url": "https://www.gstatic.com/generate_204",
  "lazy": true,
  "tolerance": 60,
  "timeout": 5000,
  "max-failed-times": 5,
  "include-all": true,
};

// 程序入口

const main = (config) => {

  const proxyCount = config?.proxies?.length ?? 0;
  const proxyProviderCount =
    typeof config?.["proxy-providers"] === "object" ? (typeof config["proxy-providers"] === 'object' && config["proxy-providers"] !== null ? Object.keys(config["proxy-providers"]) : []).length : 0;
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error("配置文件中未找到任何代理");
  }

  // 覆盖通用配置
  config["mixed-port"] = "7890";
  config["tcp-concurrent"] = true;
  config["allow-lan"] = true;
  config["ipv6"] = true;
  config["log-level"] = "info";
  config["unified-delay"] = "true";
  config["find-process-mode"] = "strict";
  config["global-client-fingerprint"] = "chrome";


  // 国内DNS服务器
  const domesticNameservers = [
    "quic://223.5.5.5",    // 阿里 DoQ（IP）
    "quic://114.114.114.114",  // 114 DNS（DoQ）
    "https://119.29.29.29/dns-query",  //腾讯 DoH
    "https://182.140.225.38/dns-query"  // 18bit（DoH）
  ];
  // 国外DNS服务器
  const foreignNameservers = [
    "quic://176.103.130.130", // AdGuard DNS（quic）
    "https://8.8.8.8/dns-query", //Google DNS（DoH）
    "https://1.1.1.1/dns-query",  // Cloudflare DNS（DoH）
    "https://9.9.9.9/dns-query" // Quad9 DNS（DoH）
  ];

  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "respect-rules": true,
    "prefer-h3": false,
    "ipv6": true,
    "cache-algorithm": "arc",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": [
      "dns.alidns.com",
      "dns.google",
      "dns.adguard-dns.com",
      "dns.18bit.cn",
      "dns.ipv4dns.com",
      "RULE-SET:Fakeip_Filter",
      "RULE-SET:CN",
      "RULE-SET:Private"],
    "default-nameserver": ["223.5.5.5", "1.2.4.8"],
    "nameserver": [...foreignNameservers],
    "proxy-server-nameserver": [...domesticNameservers],
    "direct-nameserver": [...domesticNameservers],
    "direct-nameserver-follow-policy": false,
    "nameserver-policy": {
      "geosite:cn": [...domesticNameservers]
    }
  };

  // 覆盖 geodata 配置
  config["geodata-mode"] = true;
  config["geox-url"] = {
    "geoip": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
    "geosite": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
    "mmdb": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
    "asn": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/GeoLite2-ASN.mmdb"
  };

  // 覆盖 sniffer 配置
  config["sniffer"] = {
    "enable": true,
    "parse-pure-ip": true,
    "sniff": {
      "TLS": {
        "ports": ["443", "8443"]
      },
      "HTTP": {
        "ports": ["80", "8080-8880"],
        "override-destination": true
      },
      "QUIC": {
        "ports": ["443", "8443"]
      }
    },
    "force-domain": ["+.v2ex.com"],
    "skip-domain": ["Mijia.Cloud.com"],
    "skip-src-address": ["192.168.0.3/32"],
    "skip-dst-address": ["192.168.0.3/32"]
  };


  // 覆盖 tun 配置
  config["tun"] = {
    "enable": true,
    "stack": "mixed",
    "auto-route": true,
    "auto-detect-interface": true,
    "dns-hijack": [
      "any:53",
      "tcp://any:53"
    ],
    "device": "utun0",
    "mtu": 1500,
    "strict-route": true,
    "gso": true,
    "gso-max-size": 65536,
    "udp-timeout": 300,
    "endpoint-independent-nat": false
  };

// ========== 公共代理节点列表 ==========
// 国际节点
const baseProxies = [
  "节点选择", "香港节点", "香港自动", "香港回退", "香港均衡",
  "台湾节点", "台湾自动", "台湾回退", "台湾均衡",
  "日本节点", "日本自动", "日本回退", "日本均衡",
  "新加坡节点", "新加坡自动", "新加坡回退", "新加坡均衡",
  "美国节点", "美国自动", "美国回退", "美国均衡",
  "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT",
  "尼日利亚节点", "尼日利亚自动", "尼日利亚回退", "尼日利亚均衡",
  "马来西亚节点", "马来西亚自动", "马来西亚回退", "马来西亚均衡",
  "英国节点", "英国自动", "英国回退", "英国均衡",
  "德国节点", "德国自动", "德国回退", "德国均衡"
];

// 中国大陆节点
const baseProxiesCN = [
  "节点选择", "DIRECT",
  "香港节点", "香港自动", "香港回退", "香港均衡",
  "台湾节点", "台湾自动", "台湾回退", "台湾均衡",
  "澳门节点", "澳门自动", "澳门回退", "澳门均衡",  
  "全部节点", "负载均衡", "自动选择", "自动回退"
];

// ========== 工厂函数：生成社交/国际/大陆分组 ==========
/**
 * groups 参数说明：
 * [name, icon, type, proxiesOrExtra, extra]
 * - name: 分组名称
 * - icon: 图标 URL
 * - type: select / url-test / fallback / load-balance（默认 select）
 * - proxiesOrExtra: 可以是 proxies 数组, 可以是布尔值 (true 代表 baseProxiesCN), 也可以是包含 filter 等信息的对象
 * - extra: 额外的补充字段
 */
function createGroups(groups) {
  return groups.map(groupArgs => {
    // 先进行一次参数“挪位”修正
    let [name, icon, type, proxiesOrExtra, extra] = groupArgs;

    // ==================== 新增的判断逻辑 ====================
    // 如果 type 参数不是字符串 (比如用户传入了 true 或一个对象),
    // 说明用户省略了 type, 我们需要手动修正参数位置。
    if (typeof type !== 'string') {
      extra = proxiesOrExtra;      // 原来的第4个参数挪给第5个
      proxiesOrExtra = type;       // 原来的第3个参数挪给第4个
      type = 'select';             // 第3个参数手动设为默认值 'select'
    }
    // =======================================================

    // 如果修正后 type 仍然为空，确保它有默认值
    if (!type) {
      type = 'select';
    }
    
    // 后面的逻辑与之前版本类似，但现在参数位置绝对正确
    let proxies; 
    let extraOptions = extra || {};

    if (Array.isArray(proxiesOrExtra)) {
      proxies = proxiesOrExtra;
    } else if (typeof proxiesOrExtra === 'boolean') {
      proxies = proxiesOrExtra ? baseProxiesCN : baseProxies;
    } else if (proxiesOrExtra && typeof proxiesOrExtra === 'object') {
      proxies = proxiesOrExtra.proxies; 
      extraOptions = { ...proxiesOrExtra, ...extraOptions };
      delete extraOptions.proxies;
    }

    return {
      ...groupBaseOption,
      name,
      type,
      icon,
      proxies: proxies || baseProxies,
      ...extraOptions,
    };
  });
}

// ========== 工厂函数：生成地区分组（四种类型） ==========
/**
 * createRegionGroups(region) 返回一个地区的 4 个分组
 * @param {string} name - 地区名称，例如 "香港"
 * @param {string} icon - 图标 URL
 * @param {Array<string>} proxies - select 分组的子节点（可选）
 * @param {string} filter - 正则匹配节点的 filter
 */
function createRegionGroups({ name, icon, filter }) {
  const subNames = ["自动", "回退", "均衡"];
  
  // 自动生成 select 分组的 proxies
  const proxies = subNames.map(s => `${name}${s}`);

  return [
    {
      ...groupBaseOption,
      name: `${name}节点`,
      type: "select",
      proxies,  // 自动生成
      filter,
      icon
    },
    {
      ...groupBaseOption,
      name: `${name}自动`,
      type: "url-test",
      hidden: true,
      filter,
      icon
    },
    {
      ...groupBaseOption,
      name: `${name}回退`,
      type: "fallback",
      hidden: true,
      filter,
      icon
    },
    {
      ...groupBaseOption,
      name: `${name}均衡`,
      type: "load-balance",
      hidden: true,
      strategy: "consistent-hashing",
      filter,
      icon
    }
  ];
}

// ========== 定义所有分组 ==========

// 示例灵活字段
//  [
//    "全部节点",
//    "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png",
//    "select",
//    ["自动选择", "负载均衡", "自动回退", "DIRECT"], // 自定义节点列表
//    {
//      filter: "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址)).*$"
//    }
//  ],
//  [
//    "自动选择",
//    "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png",
//    "url-test",
//    null,    // 不传 proxies，使用默认 baseProxies，true使用baseProxiesCN，false使用baseProxies
//    {
//      hidden: true,
//      filter: "(?=.*(.))(?!.*((?i)群|邀请|返利|循环)).*$"
//    }
//  ]
// 
// 1️⃣ 社交/国际分组
const socialGroups = createGroups([
  ["亚马逊电商", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/AmazonPrimeVideo.webp"],
  ["AI", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/OpenAI.png"],
  ["TVB", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/TVB.webp"],
  ["AbemaTV", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Abema.webp"],
  ["Telegram", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Telegram.png"],
  ["Twitter", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Twitter.png"],
  ["Instagram", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Instagram.png"],
  ["YouTube", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/YouTube.png"],
  ["Netflix", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Netflix.png"],
  ["Disney+", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Disney+.png"],
  ["AppleTV", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/AppleTV.png"],
  ["Twitch", "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/Twitch.webp"],
  ["亚马逊TV", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/AmazonPrimeVideo.png"],
  ["HBO", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/HBO.png"],
  ["Hulu", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Hulu.png"],
  ["ニコニコ", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Niconico.webp"],
  ["Emby", "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png"],
  ["IMDB", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/IMDB.webp"],
  ["TikTok", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/TikTok.png"],
  ["哔哩东南亚", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Biliintl.png"],
  ["FCM", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/FCM.png"],
  ["Discord", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Discord.png"],
  ["巴哈姆特", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Bahamut.png"],
  ["国际媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Pr_Media.png"],
  ["Spotify", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Spotify.png"],
  ["GitHub", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/GitHub.png"],
  ["Docker", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Docker.webp"],
  ["Speedtest", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Speedtest.png"],
  ["PayPal", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/PayPal.png"],
  ["PikPak", "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/PikPak.webp"],
  ["YouTubeMusic", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/YouTubeMusic.webp"],
  ["Apple音乐", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/AppleMusic.webp"],
  ["iCloud", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/iCloud.webp"],
  ["Talkatone", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Talkatone.png"],
  ["GoogleVoice", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/GoogleVoice.png"],
  ["Facebook", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Facebook.webp"],
  ["LINE", "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/Line.webp"],
  ["Signal", "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/Signal.webp"],
  ["Wise", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Wise.png"],
  ["BT追踪器", "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/BitTorrent.webp"],
  ["维基百科", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Wikipedia.webp"],
  ["Cloudflare", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Cloudflare.webp"],
  ["Apple", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Apple.png"],
  ["Google", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Google.png"],
  ["微软", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Microsoft.png"],
  ["OneDrive", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/OneDrive.webp"],
  ["Adobe", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Adobe.webp"],
  ["游戏平台", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Steam.png"],
  ["禁漫天堂", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/18comic.webp"],
  ["哔咔哔咔", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Picacg.webp"],
  ["Pixiv", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Pixiv.webp"],
  ["Google学术", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Scholar.webp"]
]);

// 2️⃣ 中国大陆 APP 分组
const cnAppGroups = createGroups([
  ["哔哩哔哩", "https://img.icons8.com/?size=100&id=l87yXVtzuGWB&format=png&color=000000", true],
  ["国内媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/CN_Media.png", true],
  ["AppleCN", "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/AppleCN.webp", true]
]);

// 3️⃣ 地区分组
const regionGroups = [
  ...createRegionGroups({
    name: "香港",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png",
    filter: "(?i)🇭🇰|香港|(\\b(HK|Hong|HongKong)\\b)"
  }),
  ...createRegionGroups({
    name: "澳门",
    icon: "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000",
    filter: "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b"
  }),
  ...createRegionGroups({
    name: "台湾",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png",
    filter: "(?i)🇨🇳|🇹🇼|台湾|(\\b(TW|Tai|Taiwan)\\b)"
  }),
  ...createRegionGroups({
    name: "日本",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png",
    filter: "(?i)🇯🇵|日本|东京|(\\b(JP|Japan)\\b)"
  }),
  ...createRegionGroups({
    name: "新加坡",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png",
    filter: "(?i)🇸🇬|新加坡|狮|(\\b(SG|Singapore)\\b)"
  }),
  ...createRegionGroups({
    name: "美国",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png",
    filter: "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\\b(US|United States|America)\\b)"
  }),
  ...createRegionGroups({
    name: "尼日利亚",
    icon: "https://img.icons8.com/?size=100&id=rodYaViA2Nph&format=png&color=000000",
    filter: "(?i)🇳🇬|尼日利亚|(\\b(NG|Nigeria)\\b)"
  }),
  ...createRegionGroups({
    name: "马来西亚",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png",
    filter: "(?i)🇲🇾|马来西亚|(\\b(MY|Malaysia)\\b)"
  }),
  ...createRegionGroups({
    name: "英国",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png",
    filter: "(?i)🇬🇧|英国|(\\b(UK|United Kingdom)\\b)"
  }),
  ...createRegionGroups({
    name: "德国",
    icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png",
    filter: "(?i)🇩🇪|德国|(\\b(DE|Germany)\\b)"
  })
];

  const manualGroups = [
    {
      ...groupBaseOption,
      name: "Final",
      type: "select",
      proxies: ["节点选择", "DIRECT"],
      icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png"
    },
    {
      ...groupBaseOption,
      "name": "节点选择",
      "type": "select",
      "proxies": ["自动选择", "自动回退","全部节点", "负载均衡", "DIRECT", "香港节点", "香港自动", "香港回退", "香港均衡","台湾节点","台湾自动", "台湾回退", "台湾均衡", "日本节点","日本自动", "日本回退", "日本均衡", "新加坡节点","新加坡自动", "新加坡回退", "新加坡均衡", "美国节点", "美国自动","美国回退","美国均衡", "尼日利亚节点", "尼日利亚自动", "尼日利亚回退", "尼日利亚均衡","马来西亚节点","马来西亚自动", "马来西亚回退", "马来西亚均衡", "英国节点", "英国自动", "英国回退", "英国均衡","德国节点","德国自动", "德国回退", "德国均衡"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png"
    },
     {
      ...groupBaseOption,
      "name": "全部节点",
      "proxies": ["自动选择", "负载均衡",  "自动回退", "DIRECT"],
      "type": "select",
      "include-all": true,
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|可用|剩余|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    {
      ...groupBaseOption,
      "name": "自动回退",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|可用|剩余|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    {
      ...groupBaseOption,
      "name": "负载均衡",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|可用|剩余|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    }
  ];
// ========== 覆写 config["proxy-groups"] ==========
config["proxy-groups"] = [
  ...manualGroups,
  ...socialGroups,
  ...cnAppGroups,
  ...regionGroups,
];
  // 覆盖规则集
  config["rule-providers"] = {
    "115": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/115/115_OCD_Domain.mrs",
      "path": "./ruleset/115_Domain.mrs"
    },
    "CN": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/clash-rules@release/direct.mrs",
      "path": "./ruleset/CN_Domain.mrs"
    },
    "Private": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs",
      "path": "./ruleset/Private_Domain.mrs"
    },
    "Fakeip_Filter": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/fakeip-filter.mrs",
      "path": "./ruleset/Fakeip_Filter_Domain.mrs"
    },
    "Apple": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Apple/Apple_OCD_Domain.mrs",
      "path": "./ruleset/Apple_Domain.mrs"
    },
    "Apple-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Apple/Apple_OCD_IP.mrs",
      "path": "./ruleset/Apple_IP.mrs"
    },
    "ChinaMedia": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ChinaMedia/ChinaMedia_OCD_Domain.mrs",
      "path": "./ruleset/ChinaMedia_Domain.mrs"
    },
    "ChinaMedia-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ChinaMedia/ChinaMedia_OCD_IP.mrs",
      "path": "./ruleset/ChinaMedia_IP.mrs"
    },
    "NetEase": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/NetEase/NetEase_OCD_Domain.mrs",
      "path": "./ruleset/NetEase_Domain.mrs"
    },
    "NetEase-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/NetEase/NetEase_OCD_IP.mrs",
      "path": "./ruleset/NetEase_IP.mrs"
    },
    "PikPak": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/PikPak/PikPak_OCD_Domain.mrs",
      "path": "./ruleset/PikPak_Domain.mrs"
    },
    "YouTubeMusic": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/YouTubeMusic/YouTubeMusic_OCD_Domain.mrs",
      "path": "./ruleset/YouTubeMusic_Domain.mrs"
    },
    "Discord": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Discord/Discord_OCD_Domain.mrs",
      "path": "./ruleset/Discord_Domain.mrs"
    },
    "OpenAI": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OpenAI/OpenAI_OCD_Domain.mrs",
      "path": "./ruleset/OpenAI_Domain.mrs"
    },
    "OpenAI-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OpenAI/OpenAI_OCD_IP.mrs",
      "path": "./ruleset/OpenAI_IP.mrs"
    },
    "GitHub": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GitHub/GitHub_OCD_Domain.mrs",
      "path": "./ruleset/GitHub_Domain.mrs"
    },
    "Bahamut": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Bahamut/Bahamut_OCD_Domain.mrs",
      "path": "./ruleset/Bahamut_Domain.mrs"
    },
    "Hulu": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Hulu/Hulu_OCD_Domain.mrs",
      "path": "./ruleset/Hulu_Domain.mrs"
    },
    "TVB": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/TVB/TVB_OCD_Domain.mrs",
      "path": "./ruleset/TVB_Domain.mrs"
    },
    "Niconico": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Niconico/Niconico_OCD_Domain.mrs",
      "path": "./ruleset/Niconico_Domain.mrs"
    },
    "Alibaba": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://jsd.onmicrosoft.cn/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Alibaba/Alibaba_OCD_Domain.mrs",
      "path": "./ruleset/alibaba_Domain.mrs"
    },
    "Alibaba-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://jsd.onmicrosoft.cn/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Alibaba/Alibaba_OCD_IP.mrs",
      "path": "./ruleset/Alibaba_IP.mrs"
    },
    "AbemaTV": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AbemaTV/AbemaTV_OCD_Domain.mrs",
      "path": "./ruleset/AbemaTV_Domain.mrs"
    },
    "Adobe": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Adobe/Adobe_OCD_Domain.mrs",
      "path": "./ruleset/Adobe_Domain.mrs"
    },
    "awavenue": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.mrs",
      "path": "./ruleset/awavenue.mrs"
    },
    "gaode": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GaoDe/GaoDe_OCD_Domain.mrs",
      "path": "./ruleset/GaoDe_Domain.mrs"
    },
    "Amazon": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Amazon/Amazon_OCD_Domain.mrs",
      "path": "./ruleset/Amazon_Domain.mrs"
    },
    "Amazon-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Amazon/Amazon_OCD_IP.mrs",
      "path": "./ruleset/Amazon_IP.mrs"
    },
    "AmazonPrimeVideo": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AmazonPrimeVideo/AmazonPrimeVideo_OCD_Domain.mrs",
      "path": "./ruleset/AmazonPrimeVideo_Domain.mrs"
    },
    "AppleDev": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleDev/AppleDev_OCD_Domain.mrs",
      "path": "./ruleset/AppleDev_Domain.mrs"
    },
    "AppleFirmware": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleFirmware/AppleFirmware_OCD_Domain.mrs",
      "path": "./ruleset/AppleFirmware_Domain.mrs"
    },
    "AppleHardware": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleHardware/AppleHardware_OCD_Domain.mrs",
      "path": "./ruleset/AppleHardware_Domain.mrs"
    },
    "AppleID": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleID/AppleID_OCD_Domain.mrs",
      "path": "./ruleset/AppleID_Domain.mrs"
    },
    "AppleMedia": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleMedia/AppleMedia_OCD_Domain.mrs",
      "path": "./ruleset/AppleMedia_Domain.mrs"
    },
    "AppleMusic": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleMusic/AppleMusic_OCD_Domain.mrs",
      "path": "./ruleset/AppleMusic_Domain.mrs"
    },
    "AppleProxy": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleProxy/AppleProxy_OCD_Domain.mrs",
      "path": "./ruleset/AppleProxy_Domain.mrs"
    },
    "AppleTV": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleTV/AppleTV_OCD_Domain.mrs",
      "path": "./ruleset/AppleTV_Domain.mrs"
    },
    "Baidu": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Baidu/Baidu_OCD_Domain.mrs",
      "path": "./ruleset/Baidu_Domain.mrs"
    },
    "Bing": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Bing/Bing_OCD_Domain.mrs",
      "path": "./ruleset/Bing_Domain.mrs"
    },
    "Blizzard": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Blizzard/Blizzard_OCD_Domain.mrs",
      "path": "./ruleset/Blizzard_Domain.mrs"
    },
    "Blizzard-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Blizzard/Blizzard_OCD_IP.mrs",
      "path": "./ruleset/Blizzard_IP.mrs"
    },
    "ByteDance": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ByteDance/ByteDance_OCD_Domain.mrs",
      "path": "./ruleset/ByteDance_Domain.mrs"
    },
    "ByteDance-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ByteDance/ByteDance_OCD_IP.mrs",
      "path": "./ruleset/ByteDance_IP.mrs"
    },
    "Claude": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Claude/Claude_OCD_Domain.mrs",
      "path": "./ruleset/Claude_Domain.mrs"
    },
    "Copilot": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Copilot/Copilot_OCD_Domain.mrs",
      "path": "./ruleset/Copilot_Domain.mrs"
    },
    "Copilot-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Copilot/Copilot_OCD_IP.mrs",
      "path": "./ruleset/Copilot_IP.mrs"
    },
    "DingTalk": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/DingTalk/DingTalk_OCD_Domain.mrs",
      "path": "./ruleset/DingTalk_Domain.mrs"
    },
    "Docker": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Docker/Docker_OCD_Domain.mrs",
      "path": "./ruleset/Docker_Domain.mrs"
    },
    "DouYin": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/DouYin/DouYin_OCD_Domain.mrs",
      "path": "./ruleset/DouYin_Domain.mrs"
    },
    "EA": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/EA/EA_OCD_Domain.mrs",
      "path": "./ruleset/EA_Domain.mrs"
    },
    "Epic": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Epic/Epic_OCD_Domain.mrs",
      "path": "./ruleset/Epic_Domain.mrs"
    },
    "Gemini": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Gemini/Gemini_OCD_Domain.mrs",
      "path": "./ruleset/Gemini_Domain.mrs"
    },
    "GoogleDrive": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleDrive/GoogleDrive_OCD_Domain.mrs",
      "path": "./ruleset/GoogleDrive_Domain.mrs"
    },
    "GoogleEarth": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleEarth/GoogleEarth_OCD_Domain.mrs",
      "path": "./ruleset/GoogleEarth_Domain.mrs"
    },
    "GoogleFCM": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleFCM/GoogleFCM_OCD_Domain.mrs",
      "path": "./ruleset/GoogleFCM_Domain.mrs"
    },
    "GoogleFCM-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleFCM/GoogleFCM_OCD_IP.mrs",
      "path": "./ruleset/GoogleFCM_IP.mrs"
    },
    "GoogleVoice": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleVoice/GoogleVoice_OCD_Domain.mrs",
      "path": "./ruleset/GoogleVoice_Domain.mrs"
    },
    "HuluJP": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/HuluJP/HuluJP_OCD_Domain.mrs",
      "path": "./ruleset/HuluJP_Domain.mrs"
    },
    "HuluUSA": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/HuluUSA/HuluUSA_OCD_Domain.mrs",
      "path": "./ruleset/HuluUSA_Domain.mrs"
    },
    "iCloud": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/iCloud/iCloud_OCD_Domain.mrs",
      "path": "./ruleset/iCloud_Domain.mrs"
    },
    "IMDB": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/IMDB/IMDB_OCD_Domain.mrs",
      "path": "./ruleset/IMDB_Domain.mrs"
    },
    "Instagram": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Instagram/Instagram_OCD_Domain.mrs",
      "path": "./ruleset/Instagram_Domain.mrs"
    },
    "Microsoft": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Microsoft/Microsoft_OCD_Domain.mrs",
      "path": "./ruleset/Microsoft_Domain.mrs"
    },
    "MicrosoftEdge": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/MicrosoftEdge/MicrosoftEdge_OCD_Domain.mrs",
      "path": "./ruleset/MicrosoftEdge_Domain.mrs"
    },
    "NGA": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/NGA/NGA_OCD_Domain.mrs",
      "path": "./ruleset/NGA_Domain.mrs"
    },
    "OneDrive": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OneDrive/OneDrive_OCD_Domain.mrs",
      "path": "./ruleset/OneDrive_Domain.mrs"
    },
    "PayPal": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/PayPal/PayPal_OCD_Domain.mrs",
      "path": "./ruleset/PayPal_Domain.mrs"
    },
    "PlayStation": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/PlayStation/PlayStation_OCD_Domain.mrs",
      "path": "./ruleset/PlayStation_Domain.mrs"
    },
    "Rockstar": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Rockstar/Rockstar_OCD_Domain.mrs",
      "path": "./ruleset/Rockstar_Domain.mrs"
    },
    "Scholar": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Scholar/Scholar_OCD_Domain.mrs",
      "path": "./ruleset/Scholar_Domain.mrs"
    },
    "Siri": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Siri/Siri_OCD_Domain.mrs",
      "path": "./ruleset/Siri_Domain.mrs"
    },
    "Sony": {
      ...ruleProviderCommon,

      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Sony/Sony_OCD_Domain.mrs",
      "path": "./ruleset/Sony_Domain.mrs"
    },
    "Speedtest": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Speedtest/Speedtest_OCD_Domain.mrs",
      "path": "./ruleset/Speedtest_Domain.mrs"
    },
    "Steam": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Steam/Steam_OCD_Domain.mrs",
      "path": "./ruleset/Steam_Domain.mrs"
    },
    "SteamCN": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/SteamCN/SteamCN_OCD_Domain.mrs",
      "path": "./ruleset/SteamCN_Domain.mrs"
    },
    "Supercell": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Supercell/Supercell_OCD_Domain.mrs",
      "path": "./ruleset/Supercell_Domain.mrs"
    },
    "Supercell-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Supercell/Supercell_OCD_IP.mrs",
      "path": "./ruleset/Supercell_IP.mrs"
    },
    "SystemOTA": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/SystemOTA/SystemOTA_OCD_Domain.mrs",
      "path": "./ruleset/SystemOTA_Domain.mrs"
    },
    "Teams": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Teams/Teams_OCD_Domain.mrs",
      "path": "./ruleset/Teams_Domain.mrs"
    },
    "Tencent": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Tencent/Tencent_OCD_Domain.mrs",
      "path": "./ruleset/Tencent_Domain.mrs"
    },
    "Tencent-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Tencent/Tencent_OCD_IP.mrs",
      "path": "./ruleset/Tencent_IP.mrs"
    },
    "Pixiv": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Pixiv/Pixiv_OCD_Domain.mrs",
      "path": "./ruleset/Pixiv_Domain.mrs"
    },
    "Wikipedia": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Wikipedia/Wikipedia_OCD_Domain.mrs",
      "path": "./ruleset/Wikipedia_Domain.mrs"
    },
    "Twitch": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Twitch/Twitch_OCD_Domain.mrs",
      "path": "./ruleset/Twitch_Domain.mrs"
    },
    "Twitch-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Twitch/Twitch_OCD_IP.mrs",
      "path": "./ruleset/Twitch_IP.mrs"
    },
    "HBO": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/HBO/HBO_OCD_Domain.mrs",
      "path": "./ruleset/HBO_Domain.mrs"
    },
    "Line": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Line/Line_OCD_Domain.mrs",
      "path": "./ruleset/Line_Domain.mrs"
    },
    "Line-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Line/Line_OCD_IP.mrs",
      "path": "./ruleset/Line_IP.mrs"
    },
    "Emby": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Emby/Emby_OCD_Domain.mrs",
      "path": "./ruleset/Emby_Domain.mrs"
    },
    "BiliBili": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BiliBili/BiliBili_OCD_Domain.mrs",
      "path": "./ruleset/BiliBili_Domain.mrs"
    },
    "BiliBili-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BiliBili/BiliBili_OCD_IP.mrs",
      "path": "./ruleset/BiliBili_IP.mrs"
    },
    "Disney": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Disney/Disney_OCD_Domain.mrs",
      "path": "./ruleset/Disney_Domain.mrs"
    },
    "Spotify": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Spotify/Spotify_OCD_Domain.mrs",
      "path": "./ruleset/Spotify_Domain.mrs"
    },
    "Spotify-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Spotify/Spotify_OCD_IP.mrs",
      "path": "./ruleset/Spotify_IP.mrs"
    },
    "YouTube": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/YouTube/YouTube_OCD_Domain.mrs",
      "path": "./ruleset/YouTube_Domain.mrs"
    },
    "YouTube-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/YouTube/YouTube_OCD_IP.mrs",
      "path": "./ruleset/YouTube_IP.mrs"
    },
    "GlobalMedia": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GlobalMedia/GlobalMedia_OCD_Domain.mrs",
      "path": "./ruleset/Media_Domain.mrs"
    },
    "GlobalMedia-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GlobalMedia/GlobalMedia_OCD_IP.mrs",
      "path": "./ruleset/Media_IP.mrs"
    },
    "BlockHttpDNS": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BlockHttpDNS/BlockHttpDNS_OCD_Domain.mrs",
      "path": "./ruleset/Category_httpdns_Domain.mrs"
    },
    "BlockHttpDNS-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BlockHttpDNS/BlockHttpDNS_OCD_IP.mrs",
      "path": "./ruleset/Category_httpdns_IP.mrs"
    },
    "Biliintl": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/biliintl.mrs",
      "path": "./ruleset/biliintl_Domain.mrs"
    },
    "18comic": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/18comic.mrs",
      "path": "./ruleset/18comic_Domain.mrs"
    },
    "Wise": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/wise.mrs",
      "path": "./ruleset/Wise_Domain.mrs"
    },
    "Signal": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/signal.mrs",
      "path": "./ruleset/Signal_Domain.mrs"
    },
    "Picacg": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/picacg.mrs",
      "path": "./ruleset/Picacg_Domain.mrs"
    },
    "Hoyoverse": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/hoyoverse.mrs",
      "path": "./ruleset/Hoyoverse_Domain.mrs"
    },
    "Mihoyo": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/mihoyo.mrs",
      "path": "./ruleset/Mihoyo_Domain.mrs"
    },
    "Private-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs",
      "path": "./ruleset/Private_IP.mrs"
    },
    "Cloudflare": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cloudflare.mrs",
      "path": "./ruleset/Cloudflare_Domain.mrs"
    },
    "Cloudflare-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cloudflare.mrs",
      "path": "./ruleset/Cloudflare_IP.mrs"
    },
    "Telegram": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs",
      "path": "./ruleset/Telegram_Domain.mrs"
    },
    "Telegram-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/telegram.mrs",
      "path": "./ruleset/Telegram_IP.mrs"
    },
    "Facebook": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/facebook.mrs",
      "path": "./ruleset/Facebook_Domain.mrs"
    },
    "Facebook-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/facebook.mrs",
      "path": "./ruleset/Facebook_IP.mrs"
    },
    "Twitter": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/twitter.mrs",
      "path": "./ruleset/Twitter_Domain.mrs"
    },
    "Twitter-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/twitter.mrs",
      "path": "./ruleset/Twitter_IP.mrs"
    },
    "Netflix": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/netflix.mrs",
      "path": "./ruleset/Netflix_Domain.mrs"
    },
    "Netflix-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/netflix.mrs",
      "path": "./ruleset/Netflix_IP.mrs"
    },
    "Google": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google.mrs",
      "path": "./ruleset/Google_Domain.mrs"
    },
    "Google-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/google.mrs",
      "path": "./ruleset/Google_IP.mrs"
    },
    "CN-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/clash-rules@release/cncidr.mrs",
      "path": "./ruleset/CN_IP.mrs"
    },
    "WeChat": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/WeChat/WeChat_Domain.mrs",
      "path": "./ruleset/WeChat_Domain.mrs"
    },
    "Talkatone": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/qljsyph/ruleset-icon@main/mihomo/domain/talkatone.mrs",
      "path": "./ruleset/Talkatone_Domain.mrs"
    },
    "Talkatone-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/qljsyph/ruleset-icon@main/mihomo/ipcidr/talkatone-ip.mrs",
      "path": "./ruleset/Talkatone_IP.mrs"
    },
    "TikTok": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/TikTok/TikTok_Domain.mrs",
      "path": "./ruleset/TikTok_Domain.mrs"
    },
    "Tracker": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/Tracker/Tracker_Domain.mrs",
      "path": "./ruleset/Tracker_Domain.mrs"
    },
    "Tracker-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/Tracker/Tracker_IP.mrs",
      "path": "./ruleset/Tracker_IP.mrs"
    },
    "STUN": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/STUN/STUN_Domain.mrs",
      "path": "./ruleset/STUN_Domain.mrs"
    },


  };

  // 覆盖规则
  config["rules"] = [
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-REJECT",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-LAN",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-DIRECT",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-DOMAIN",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-IP",
    "MATCH,Final"
  ];
  config["sub-rules"] = {
    "SUB-REJECT": [
      "RULE-SET,BlockHttpDNS,REJECT-DROP",
      "RULE-SET,awavenue,REJECT-DROP",
      "RULE-SET,BlockHttpDNS-ip,REJECT-DROP,no-resolve",
      "DOMAIN-KEYWORD,httpdns,REJECT-DROP",
      "RULE-SET,STUN,REJECT-DROP",
      "DST-PORT,3478,REJECT-DROP",
      "AND,(NETWORK,TCP),(DST-PORT,5349),REJECT-DROP",
      "AND,(NETWORK,UDP),(DST-PORT,5350),REJECT-DROP",
      "AND,(NETWORK,UDP),(DST-PORT,5351),REJECT-DROP",
      "AND,(NETWORK,UDP),(DST-PORT,19302),REJECT-DROP",
      "DOMAIN-KEYWORD,stun,REJECT-DROP"
    ],
    "SUB-LAN": [
      "RULE-SET,Private,DIRECT",
      "RULE-SET,Private-ip,DIRECT,no-resolve"
    ],
    "SUB-DIRECT": [
      "RULE-SET,Private,DIRECT",
      "RULE-SET,Private-ip,DIRECT,no-resolve",
      "RULE-SET,ByteDance,DIRECT",
      "RULE-SET,Tencent,DIRECT",
      "RULE-SET,CN,DIRECT",
      "RULE-SET,gaode,DIRECT",
      "RULE-SET,Alibaba,DIRECT",
      "RULE-SET,Alibaba-ip,DIRECT",
      "RULE-SET,DouYin,DIRECT",
      "RULE-SET,Baidu,DIRECT",
      "RULE-SET,DingTalk,DIRECT",
      "RULE-SET,SteamCN,DIRECT",
      "OR,((RULE-SET,115),(DOMAIN-SUFFIX,115vod.com)),DIRECT",
      "RULE-SET,WeChat,DIRECT",
      "RULE-SET,NetEase,DIRECT",
      "RULE-SET,NetEase-ip,DIRECT,no-resolve",
      "RULE-SET,ByteDance-ip,DIRECT,no-resolve",
      "RULE-SET,Tencent-ip,DIRECT,no-resolve",
      "RULE-SET,CN-ip,DIRECT",
      "RULE-SET,Fakeip_Filter,DIRECT"
    ],
    "SUB-DOMAIN": [
      "RULE-SET,AppleMusic,Apple音乐",
      "RULE-SET,AppleTV,AppleTV",
      "RULE-SET,AppleMedia,AppleTV",
      "OR,((RULE-SET,AppleProxy),(DOMAIN-KEYWORD,smp-device),(DOMAIN-KEYWORD,testflight)),Apple",
      "RULE-SET,BiliBili,哔哩哔哩",
      "RULE-SET,Biliintl,哔哩东南亚",
      "OR,((RULE-SET,TikTok),(DOMAIN-KEYWORD,tiktok)),TikTok",
      "OR,((RULE-SET,YouTube),(DOMAIN-KEYWORD,youtube)),YouTube",
      "RULE-SET,YouTubeMusic,YouTubeMusic",
      "RULE-SET,Disney,Disney+",
      "RULE-SET,Bahamut,巴哈姆特",
      "RULE-SET,HuluJP,Hulu",
      "RULE-SET,HuluUSA,Hulu",
      "RULE-SET,Hulu,Hulu",
      "RULE-SET,TVB,TVB",
      "RULE-SET,Niconico,ニコニコ",
      "RULE-SET,AbemaTV,AbemaTV",
      "OR,((RULE-SET,AmazonPrimeVideo),(DOMAIN-KEYWORD,avoddashs)),亚马逊TV",
      "RULE-SET,IMDB,IMDB",
      "RULE-SET,Spotify,Spotify",
      "OR,((RULE-SET,Spotify),(DOMAIN-KEYWORD,spotify)),Spotify",
      "OR,((RULE-SET,Twitch),(DOMAIN-KEYWORD,ttvnw)),Twitch",
      "OR,((RULE-SET,PikPak),(DOMAIN-KEYWORD,pikpak)),PikPak",
      "RULE-SET,Discord,Discord",
      "OR,((RULE-SET,Telegram),(DOMAIN-KEYWORD,nicegram)),Telegram",
      "OR,((RULE-SET,GitHub),(DOMAIN-KEYWORD,github)),GitHub",
      "OR,((RULE-SET,Amazon),(DOMAIN-KEYWORD,avoddashs)),亚马逊电商",
      "OR,((RULE-SET,Adobe),(DOMAIN-KEYWORD,adobe)),Adobe",
      "RULE-SET,Docker,Docker",
      "OR,((RULE-SET,Instagram),(DOMAIN-KEYWORD,instagram)),Instagram",
      "RULE-SET,PayPal,PayPal",
      "OR,((RULE-SET,Claude),(RULE-SET,OpenAI),(RULE-SET,Gemini),(AND,((RULE-SET,Copilot),(NOT,((DOMAIN,www.bing.com))))),(DOMAIN-KEYWORD,openai),(DOMAIN-KEYWORD,openaicom-api),(DOMAIN-KEYWORD,colab),(DOMAIN-KEYWORD,developerprofiles),(DOMAIN-KEYWORD,generativelanguage)),AI",
      "OR,((RULE-SET,Speedtest),(DOMAIN-KEYWORD,speedtest)),Speedtest",
      "RULE-SET,Pixiv,Pixiv",
      "RULE-SET,Wikipedia,维基百科",
      "RULE-SET,Blizzard,游戏平台",
      "OR,((RULE-SET,Steam),(DOMAIN-KEYWORD,steambroadcast),(DOMAIN-KEYWORD,steamstore),(DOMAIN-KEYWORD,steamuserimages)),游戏平台",
      "RULE-SET,Rockstar,游戏平台",
      "RULE-SET,PlayStation,游戏平台",
      "RULE-SET,Epic,游戏平台",
      "RULE-SET,Supercell,游戏平台",
      "RULE-SET,EA,游戏平台",
      "RULE-SET,NGA,游戏平台",
      "RULE-SET,Sony,游戏平台",
      "RULE-SET,Hoyoverse,游戏平台",
      "RULE-SET,18comic,禁漫天堂",
      "RULE-SET,GoogleDrive,Google",
      "RULE-SET,GoogleEarth,Google",
      "RULE-SET,GoogleFCM,FCM",
      "RULE-SET,GoogleVoice,GoogleVoice",
      "RULE-SET,Scholar,Google学术",
      "RULE-SET,HBO,HBO",
      "RULE-SET,Line,LINE",
      "RULE-SET,Wise,Wise",
      "RULE-SET,Signal,Signal",
      "RULE-SET,Picacg,哔咔哔咔",
      "OR,((RULE-SET,Emby,Emby),(DOMAIN-KEYWORD,emby)),Emby",
      "RULE-SET,Talkatone,Talkatone",
      "OR,((RULE-SET,Facebook),(DOMAIN-KEYWORD,facebook),(DOMAIN-KEYWORD,fbcdn)),Facebook",
      "OR,((RULE-SET,Twitter),(DOMAIN-KEYWORD,twitter)),Twitter",
      "RULE-SET,Netflix,Netflix",
      "RULE-SET,Google,Google",
      "RULE-SET,Cloudflare,Cloudflare",
      "RULE-SET,iCloud,iCloud",
      "OR,((RULE-SET,Siri),(RULE-SET,SystemOTA),(RULE-SET,AppleID),(RULE-SET,AppleDev),(RULE-SET,AppleFirmware),(RULE-SET,AppleHardware),(RULE-SET,Apple)),AppleCN",
      "OR,((RULE-SET,Tracker),(DOMAIN-KEYWORD,announce),(DOMAIN-KEYWORD,chdbits),(DOMAIN-KEYWORD,m-team),(DOMAIN-KEYWORD,torrent)),BT追踪器",
      "RULE-SET,Mihoyo,游戏平台",
      "OR,((RULE-SET,OneDrive),(DOMAIN-KEYWORD,1drv),(DOMAIN-KEYWORD,onedrive),(DOMAIN-KEYWORD,skydrive)),OneDrive",
      "OR,((RULE-SET,Bing),(RULE-SET,Teams),(RULE-SET,MicrosoftEdge),(RULE-SET,Microsoft),(DOMAIN-KEYWORD,microsoft),(DOMAIN-KEYWORD,skydrive)),微软",
      "RULE-SET,GlobalMedia,国际媒体",
      "RULE-SET,ChinaMedia,国内媒体",
    ],
    "SUB-IP": [
      "RULE-SET,BiliBili-ip,哔哩哔哩,no-resolve",
      "RULE-SET,ChinaMedia-ip,国内媒体,no-resolve",
      "RULE-SET,Apple-ip,Apple,no-resolve",
      "RULE-SET,Spotify-ip,Spotify,no-resolve",
      "RULE-SET,Twitch-ip,Twitch,no-resolve",
      "RULE-SET,Telegram-ip,Telegram,no-resolve",
      "RULE-SET,Amazon-ip,亚马逊电商,no-resolve",
      "RULE-SET,Copilot-ip,AI,no-resolve",
      "RULE-SET,OpenAI-ip,AI,no-resolve",
      "RULE-SET,Blizzard-ip,游戏平台,no-resolve",
      "RULE-SET,Supercell-ip,游戏平台,no-resolve",
      "RULE-SET,GoogleFCM-ip,FCM,no-resolve",
      "RULE-SET,Line-ip,LINE,no-resolve",
      "RULE-SET,Talkatone-ip,Talkatone,no-resolve",
      "RULE-SET,Facebook-ip,Facebook,no-resolve",
      "RULE-SET,Twitter-ip,Twitter,no-resolve",
      "RULE-SET,Netflix-ip,Netflix,no-resolve",
      "RULE-SET,Google-ip,Google,no-resolve",
      "RULE-SET,Tracker-ip,BT追踪器,no-resolve",
      "RULE-SET,YouTube-ip,YouTube,no-resolve",
      "RULE-SET,Cloudflare-ip,Cloudflare,no-resolve",
      "RULE-SET,GlobalMedia-ip,国际媒体,no-resolve",
    ]
  };

  // 返回修改后的配置
  return config;
};
