// 规则集通用配置
const ruleProviderCommon = {
  "interval": 86400,
  "proxy": "DIRECT",
  "type": "http",
  "format": "mrs",
};

// 1. 排除所有杂项/管理/通知信息（例如：官网、到期、流量剩余）
const EX_INFO = [
  // 中文杂项/管理信息
  "(?i)群|邀请|返利|循环|建议|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入",
  // 英文/格式化信息（流量、日期等）
  "可用|剩余|(\\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\\b|\\d{4}-\\d{2}-\\d{2}|\\d+G)"
].join('|');

// 2. 排除所有高倍率标识
const EX_RATE = [
  "高倍|高倍率|倍率[2-9]",
  // 各种括号或无括号的倍率格式
  "x[2-9]\\.?\\d*",
  "\\([xX][2-9]\\.?\\d*\\)",
  "\\[[xX][2-9]\\.?\\d*\\]",
  "\\{[xX][2-9]\\.?\\d*\\}",
  "（[xX][2-9]\\.?\\d*）",
  "【[xX][2-9]\\.?\\d*】",
  "【[2-9]x】",
  "【\\d+[xX]】"
].join('|');

// 3. 组合最终的排除字符串
const EX_ALL = `${EX_INFO}|${EX_RATE}`;

// 策略组通用配置 (移除所有默认过滤，让工厂函数负责)
const groupBaseOption = {
  "interval": 300,
  "url": "https://www.gstatic.com/generate_204",
  "lazy": true,
  "tolerance": 60,
  "timeout": 5000,
  "max-failed-times": 5,
  "include-all": true,

  // ⭐ 关键修改：移除默认的 exclude-filter ⭐
  // "exclude-filter": EX_INFO, // 移除这行！

  "filter": ""  // 确保 filter 为空
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
  config["mixed-port"] = 7890;
  config["tcp-concurrent"] = true;
  config["allow-lan"] = true;
  config["ipv6"] = true;
  config["log-level"] = "info";
  config["unified-delay"] = true;
  config["find-process-mode"] = "always";
  config["global-client-fingerprint"] = "chrome";


  // 国内DNS服务器 (使用 DoH)
  const domesticNameservers = [
  "quic://dns.alidns.com", // 阿里DoH
  "https://doh.pub/dns-query", // 腾讯DoH
  "quic://dns.18bit.cn"  // 18bit（DoH）
  ];

  // 国外 DNS 服务器（精简稳定版）
  const foreignNameservers = [
  "quic://dns.adguard-dns.com", 
  "https://cloudflare-dns.com/dns-query#h3=true",       // Cloudflare (快 + 稳定)
  "https://8.8.8.8/dns-query",       // Google (广泛可用)
  ];

  // 默认明文 DNS (用于 default-nameserver 和 proxy-server-nameserver 一致性)
  const defaultNameservers = ["223.5.5.5", "1.12.12.12"];


  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "respect-rules": true,
    "prefer-h3": true,
    "ipv6": true,
    "cache-algorithm": "arc",
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-range6": "fdfe:dcba:9876::/64",
    "fake-ip-filter": [
      "RULE-SET,Fakeip-Filter",
      "RULE-SET,Private",
      "RULE-SET,CN"
    ],
    "default-nameserver": [...defaultNameservers],
    "nameserver": [...foreignNameservers],
    "proxy-server-nameserver": [...defaultNameservers],
    "direct-nameserver": [...defaultNameservers],
    "direct-nameserver-follow-policy": true,
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
    "device": "mihomo",
    "mtu": 1500,
    "strict-route": true,
    "udp-timeout": 300,
    "endpoint-independent-nat": false
  };

  // ========== 公共代理节点列表 ==========
  // 国际节点
  const baseProxies = [
    "节点选择", "香港节点",
    "台湾节点",
    "日本节点",
    "新加坡节点",
    "美国节点",
    "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT",
  ];

  // 中国大陆节点
  const baseProxiesCN = [
    "DIRECT",
    "节点选择", 
    "香港节点",
    "台湾节点",
    "澳门节点",
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
  // ========== 工厂函数：生成社交/国际/大陆分组 ==========
  // ========== 工厂函数：生成社交/国际/大陆分组 (修正版) ==========
  function createGroups(groups) {
    return groups.map(groupArgs => {
      // 先进行一次参数“挪位”修正
      let [name, icon, type, proxiesOrExtra, extra] = groupArgs;

      // 参数修正逻辑
      if (typeof type !== 'string') {
        extra = proxiesOrExtra;
        proxiesOrExtra = type;
        type = 'select';
      }
      if (!type) {
        type = 'select';
      }

      let proxies;
      let extraOptions = extra || {};

      if (Array.isArray(proxiesOrExtra)) {
        proxies = proxiesOrExtra;
      } else if (typeof proxiesOrExtra === 'boolean') {
        // cnAppGroups 使用此逻辑
        proxies = proxiesOrExtra ? baseProxiesCN : baseProxies;
      } else if (proxiesOrExtra && typeof proxiesOrExtra === 'object') {
        proxies = proxiesOrExtra.proxies;
        extraOptions = { ...proxiesOrExtra, ...extraOptions };
        delete extraOptions.proxies;
      }

      // 1. 构造初始配置对象
      const groupConfig = {
        ...groupBaseOption,
        name,
        type,
        icon,
        proxies: proxies || baseProxies,
        ...extraOptions,
      };

      // 2. ⭐ 关键修正：在返回前注入 exclude-filter ⭐
      // 对于 select 组（如 AI, YouTube），我们通常希望保留所有节点。
      // 但对于 cnAppGroups 中的 "国内媒体" 组 (type 仍为 select)，我们希望它能排除杂项。
      // 在这里，我们只对非 select 组添加 EX_ALL (高倍率+杂项)，因为你的手动组已经处理了自动选择/回退/均衡。
      // 但是，社交组（AI, YouTube等）默认是 select 组，如果想让他们排除杂项，需要在这里处理。

      // 对于通过 createGroups 创建的【所有】分组，如果它们没有自定义 exclude-filter，则至少排除 EX_INFO（杂项/管理信息）。
      if (!groupConfig["exclude-filter"]) {
        // 国际分组的 select 组（AI, Telegram, YouTube）排除杂项
        // 国内分组的 select 组（国内媒体）排除杂项
        groupConfig["exclude-filter"] = EX_INFO;
      }

      // 地区分组和手动组已在外层处理，无需额外修改。

      // 最终返回修改后的配置对象
      return groupConfig;
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
  // ⭐ 确保 EXCLUDE_FILTER_STRING 已经定义，用于排除杂项和高倍率节点 ⭐

  // ... [EXCLUDE_FILTER_STRING 的定义保持不变] ...

  // ========== 工厂函数：生成地区分组（四种类型） ==========
 // 假设 EX_INFO, EX_RATE, EX_ALL, groupBaseOption 都已定义
// EX_ALL 是杂项和高倍率的组合：const EX_ALL = `${EX_INFO}|${EX_RATE}`;
// EX_INFO 仅是杂项过滤：const EX_INFO = "...";

function createRegionGroups({ name, icon, filter }) {
    // 包含 "均衡"
    const subNames = ["自动", "回退", "均衡"];

    const proxies = subNames.map(s => `${name}${s}`); // 例如: "香港自动", "香港回退", "香港均衡"

    const regionFilter = filter;
    
    // 自动选择/负载均衡 排除所有 (EX_INFO | EX_RATE)
    const excludeForAutoGroups = EX_ALL; 
    
    // 自动回退 仅排除杂项 (EX_INFO)
    const excludeForFallback = EX_INFO; 

    return [
      // 1. SELECT 组 (手动选择) - 只做地区过滤
      {
        ...groupBaseOption,
        name: `${name}节点`,
        type: "select",
        proxies,
        filter: regionFilter,
        icon
      },

      // 2. URL-TEST 组 (自动选择) - 排除所有 (EX_ALL)
      {
        ...groupBaseOption,
        name: `${name}自动`,
        type: "url-test",
        hidden: true,
        filter: regionFilter, 
        "exclude-filter": excludeForAutoGroups, // EX_ALL (排除杂项和高倍率)
        icon
      },

      // 3. FALLBACK 组 (自动回退) - 仅排除杂项 (EX_INFO)
      {
        ...groupBaseOption,
        name: `${name}回退`,
        type: "fallback",
        hidden: true,
        filter: regionFilter,
        "exclude-filter": excludeForFallback, // EX_INFO (只排除杂项)
        icon
      },
      
      // 4. LOAD-BALANCE 组 (负载均衡) - 排除所有 (EX_ALL)
      {
        ...groupBaseOption,
        name: `${name}均衡`,
        type: "load-balance", // ⭐ 新增的负载均衡类型
        hidden: true,
        filter: regionFilter,
        "exclude-filter": excludeForAutoGroups, // EX_ALL (排除杂项和高倍率)
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
  ["AI", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/OpenAI.png"],
  ["Telegram", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Telegram.png"],
  ["Twitter", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Twitter.png"],
  ["Instagram", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Instagram.png"],
  ["YouTube", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/YouTube.png"],
  ["Netflix", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Netflix.png"],
  ["Emby", "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png"],
  ["TikTok", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/TikTok.png"],
  ["FCM", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/FCM.png"],
  ["国际媒体", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Pr_Media.png"],
  ["GitHub", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/GitHub.png"],
  ["Speedtest", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Speedtest.png"],
  ["Talkatone", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Talkatone.png"],
  ["Apple", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Apple.png"],
  ["Google", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Google.png"],
  ["微软", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Microsoft.png"],
  ["游戏平台", "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Steam.png"],
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
      "proxies": ["自动选择", "自动回退", "全部节点", "负载均衡", "DIRECT", "香港节点", "香港自动", "香港回退", "香港均衡", "台湾节点", "台湾自动", "台湾回退", "台湾均衡", "日本节点", "日本自动", "日本回退", "日本均衡", "新加坡节点", "新加坡自动", "新加坡回退", "新加坡均衡", "美国节点", "美国自动", "美国回退", "美国均衡"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png"
    },
    {
      ...groupBaseOption,
      "name": "全部节点",
      "proxies": ["自动选择", "负载均衡", "自动回退", "DIRECT"],
      "type": "select",
      "include-all": true,

      // ❗ 移除复杂的 filter ❗ 
      // "filter": "(?=.*(.))(?!.*((?i)群|邀请|...)...).*$", 
      "filter": "", // 清空 filter

      // ⭐ 关键：使用 EX_INFO 排除所有杂项/管理/通知信息 ⭐
      "exclude-filter": EX_INFO,

      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    // 自动选择组
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,

      // 1. 清空不稳定的 filter
      "filter": "",

      // 2. ⭐ 关键：使用 EX_ALL 排除所有杂项和高倍率 ⭐
      "exclude-filter": EX_ALL,

      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    // 自动回退组
    {
      ...groupBaseOption,
      "name": "自动回退",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,

      // 1. 清空不稳定的 filter
      "filter": "",

      // 2. ⭐ 关键：使用 EX_ALL 排除所有杂项和高倍率 ⭐
      "exclude-filter": EX_INFO,

      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    // 负载均衡组
    {
      ...groupBaseOption,
      "name": "负载均衡",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,

      // 1. 清空不稳定的 filter
      "filter": "",

      // 2. ⭐ 关键：使用 EX_ALL 排除所有杂项和高倍率 ⭐
      "exclude-filter": EX_ALL,

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
    "Emby": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Emby/Emby_OCD_Domain.mrs",
      "path": "./ruleset/Emby_Domain.mrs"
    },
    "SteamCN": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/SteamCN/SteamCN_OCD_Domain.mrs",
      "path": "./ruleset/SteamCN_Domain.mrs"
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
    "awavenue": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.mrs",
      "path": "./ruleset/awavenue.mrs"
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
    "Gemini": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Gemini/Gemini_OCD_Domain.mrs",
      "path": "./ruleset/Gemini_Domain.mrs"
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
    "Private-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs",
      "path": "./ruleset/Private_IP.mrs"
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
    "CN-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/clash-rules@release/cncidr.mrs",
      "path": "./ruleset/CN_IP.mrs"
    },
    "STUN": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/STUN/STUN_Domain.mrs",
      "path": "./ruleset/STUN_Domain.mrs"
    },


  };

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
    "Siri": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Siri/Siri_OCD_Domain.mrs",
      "path": "./ruleset/Siri_Domain.mrs"
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
    "Private-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs",
      "path": "./ruleset/Private_IP.mrs"
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
    "STUN": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/STUN/STUN_Domain.mrs",
      "path": "./ruleset/STUN_Domain.mrs"
    }
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
      "RULE-SET,BlockHttpDNS-ip,REJECT-DROP,no-resolve",
      "RULE-SET,awavenue,REJECT",
      "RULE-SET,STUN,REJECT"
    ],
    "SUB-LAN": [
      "RULE-SET,Private,DIRECT",
      "RULE-SET,Private-ip,DIRECT,no-resolve"
    ],
    "SUB-DIRECT": [
      "RULE-SET,ByteDance,DIRECT",
      "RULE-SET,Tencent,DIRECT",
      "RULE-SET,CN,DIRECT",
      "RULE-SET,Alibaba,DIRECT",
      "RULE-SET,Alibaba-ip,DIRECT",
      "RULE-SET,gaode,DIRECT",
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
      "OR,((RULE-SET,AppleProxy),(DOMAIN-KEYWORD,smp-device),(DOMAIN-KEYWORD,testflight)),Apple",
      "OR,((RULE-SET,TikTok),(DOMAIN-KEYWORD,tiktok)),TikTok",
      "OR,((RULE-SET,YouTube),(DOMAIN-KEYWORD,youtube)),YouTube",
      "OR,((RULE-SET,Telegram),(DOMAIN-KEYWORD,nicegram)),Telegram",
      "OR,((RULE-SET,GitHub),(DOMAIN-KEYWORD,github)),GitHub",
      "OR,((RULE-SET,Instagram),(DOMAIN-KEYWORD,instagram)),Instagram",
      "OR,((RULE-SET,Claude),(RULE-SET,OpenAI),(RULE-SET,Gemini),(AND,((RULE-SET,Copilot),(NOT,((DOMAIN,www.bing.com))))),(DOMAIN-KEYWORD,openai),(DOMAIN-KEYWORD,openaicom-api),(DOMAIN-KEYWORD,colab),(DOMAIN-KEYWORD,developerprofiles),(DOMAIN-KEYWORD,generativelanguage)),AI",
      "OR,((RULE-SET,Speedtest),(DOMAIN-KEYWORD,speedtest)),Speedtest",
      "OR,((RULE-SET,Steam),(DOMAIN-KEYWORD,steambroadcast),(DOMAIN-KEYWORD,steamstore),(DOMAIN-KEYWORD,steamuserimages)),游戏平台",
      "RULE-SET,Epic,游戏平台",
      "RULE-SET,EA,游戏平台",
      "RULE-SET,BiliBili,哔哩哔哩",
      "RULE-SET,GoogleDrive,Google",
      "RULE-SET,GoogleFCM,FCM",
      "OR,((RULE-SET,Emby,Emby),(DOMAIN-KEYWORD,emby)),Emby",
      "RULE-SET,Talkatone,Talkatone",
      "OR,((RULE-SET,Twitter),(DOMAIN-KEYWORD,twitter)),Twitter",
      "RULE-SET,Netflix,Netflix",
      "RULE-SET,Google,Google",
      "OR,((RULE-SET,Siri),(RULE-SET,SystemOTA),(RULE-SET,AppleID),(RULE-SET,AppleDev),(RULE-SET,AppleFirmware),(RULE-SET,AppleHardware),(RULE-SET,Apple)),AppleCN",
      "OR,((RULE-SET,Bing),(RULE-SET,Teams),(RULE-SET,MicrosoftEdge),(RULE-SET,Microsoft),(DOMAIN-KEYWORD,microsoft),(DOMAIN-KEYWORD,skydrive)),微软",
      "RULE-SET,GlobalMedia,国际媒体",
      "RULE-SET,ChinaMedia,国内媒体"
    ],
    "SUB-IP": [
      "RULE-SET,BiliBili-ip,哔哩哔哩,no-resolve",
      "RULE-SET,ChinaMedia-ip,国内媒体,no-resolve",
      "RULE-SET,Apple-ip,Apple,no-resolve",
      "RULE-SET,Telegram-ip,Telegram,no-resolve",
      "RULE-SET,Copilot-ip,AI,no-resolve",
      "RULE-SET,OpenAI-ip,AI,no-resolve",
      "RULE-SET,GoogleFCM-ip,FCM,no-resolve",
      "RULE-SET,Talkatone-ip,Talkatone,no-resolve",
      "RULE-SET,Twitter-ip,Twitter,no-resolve",
      "RULE-SET,Netflix-ip,Netflix,no-resolve",
      "RULE-SET,Google-ip,Google,no-resolve",
      "RULE-SET,YouTube-ip,YouTube,no-resolve",
      "RULE-SET,GlobalMedia-ip,国际媒体,no-resolve"
    ]
  };

  // 返回修改后的配置
  return config;
};