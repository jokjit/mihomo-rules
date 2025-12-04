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
  const defaultNameservers = ["223.5.5.5", "119.29.29.29"];


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
    "fake-ip-range6": "fdfe:dcba:9876::/64",
    "fake-ip-filter": [
      "dns.alidns.com",
      "dns.google",
      "cloudflare-dns.com",
      "dns.18bit.cn",
      "dns.ipv4dns.com",
      "RULE-SET:Fakeip_Filter",
      "RULE-SET:CN",
      "RULE-SET:Private"],
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
    "负载均衡", "自动选择", "自动回退", "DIRECT",
  ];

  // 中国大陆节点
  const baseProxiesCN = [
    "DIRECT",
    "节点选择", 
    "香港节点",
    "台湾节点",
    "澳门节点",
    "负载均衡", "自动选择", "自动回退"
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
      // 对于 select 组（如 AI），我们通常希望保留所有节点。
      // 但对于 cnAppGroups 中的 "国内媒体" 组 (type 仍为 select)，我们希望它能排除杂项。
      // 在这里，我们只对非 select 组添加 EX_ALL (高倍率+杂项)，因为你的手动组已经处理了自动选择/回退/均衡。
      // 但是，社交组（AI, YouTube等）默认是 select 组，如果想让他们排除杂项，需要在这里处理。

      // 对于通过 createGroups 创建的【所有】分组，如果它们没有自定义 exclude-filter，则至少排除 EX_INFO（杂项/管理信息）。
      if (!groupConfig["exclude-filter"]) {
        // 国际分组的 select 组（AI,）排除杂项
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
  //   
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
  // 1️⃣ 国际分组
  const socialGroups = createGroups([
    
  ]);

  // 2️⃣ 中国大陆 APP 分组
  const cnAppGroups = createGroups([
    
  ]);

  // 3️⃣ 地区分组
  const regionGroups = [
    ...createRegionGroups({
      name: "香港",
      icon: "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png",
      filter: "(?i)🇭🇰|香港|(\\b(HK|Hong|HongKong)\\b)"
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
      "proxies": ["自动选择", "自动回退", "负载均衡", "香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "DIRECT"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png"
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
    "awavenue": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.mrs",
      "path": "./ruleset/awavenue.mrs"
    },
    "Private-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs",
      "path": "./ruleset/Private_IP.mrs"
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
    }
  };

  // 覆盖规则
  config["rules"] = [
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-REJECT",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-LAN",
    "SUB-RULE,(OR,((NETWORK,UDP),(NETWORK,TCP))),SUB-DIRECT",
    "MATCH,Final"
  ];
  config["sub-rules"] = {
    "SUB-REJECT": [
      "RULE-SET,awavenue,REJECT-DROP",
      "RULE-SET,STUN,REJECT-DROP"
    ],
    "SUB-LAN": [
      "RULE-SET,Private,DIRECT",
      "RULE-SET,Private-ip,DIRECT,no-resolve"
    ],
    "SUB-DIRECT": [
      "RULE-SET,CN,DIRECT",
      "RULE-SET,CN-ip,DIRECT,no-resolve",
      "RULE-SET,Fakeip_Filter,DIRECT"
    ]
  };

  // 返回修改后的配置
  return config;
};