// 规则集通用配置
const ruleProviderCommon = {
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
    "quic://dns.18bit.cn#ecs=114.114.114.114/24&ecs-override=true",
    "quic://dns.ipv4dns.com#ecs=114.114.114.114/24&ecs-override=true",
    "quic://2025.dns1.top#ecs=114.114.114.114/24&ecs-override=true",
    "quic://dns.alidns.com#ecs=114.114.114.114/24&ecs-override=true",
    "https://doh.pub/dns-query" // 腾讯DoH，
  ];
  // 国外DNS服务器
  const foreignNameservers = [
    "quic://dns.adguard-dns.com#ecs=1.1.1.1/24&ecs-override=true",
    "https://cloudflare-dns.com/dns-query#h3=true&ecs=1.1.1.1/24&ecs-override=true",
    "https://dns.google/dns-query#h3=true&ecs=1.1.1.1/24&ecs-override=true",
    "https://208.67.222.222/dns-query#ecs=1.1.1.1/24&ecs-override=true" // OpenDNS
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
      "cloudflare-dns.com",
      "dns.google",
      "dns.adguard-dns.com",
      "dns.18bit.cn",
      "2025.dns1.top",
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

  // 覆盖策略组
  config["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "Final",
      "type": "select",
      "proxies": ["节点选择", "DIRECT"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png"
    },
    {
      ...groupBaseOption,
      "name": "节点选择",
      "type": "select",
      "proxies": ["香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png"
    },
    {
      ...groupBaseOption,
      "name": "AI",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/OpenAI.png"
    },
    {
      ...groupBaseOption,
      "name": "YouTube",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/YouTube.png"
    },
    {
      ...groupBaseOption,
      "name": "Netflix",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Netflix.png"
    },
    {
      ...groupBaseOption,
      "name": "Emby",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png"
    },
    {
      ...groupBaseOption,
      "name": "TikTok",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/TikTok.png"
    },
    {
      ...groupBaseOption,
      "name": "哔哩哔哩",
      "type": "select",
      "proxies": ["DIRECT", "香港节点", "台湾节点", "澳门节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/BiliBili.png"
    },
    {
      ...groupBaseOption,
      "name": "FCM",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/FCM.png"
    },
    {
      ...groupBaseOption,
      "name": "国内媒体",
      "type": "select",
      "proxies": ["DIRECT", "节点选择"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/CN_Media.png"
    },
    {
      ...groupBaseOption,
      "name": "国际媒体",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Pr_Media.png"
    },
    {
      ...groupBaseOption,
      "name": "GitHub",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/GitHub.png"
    },
    {
      ...groupBaseOption,
      "name": "Speedtest",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Speedtest.png"
    },
    {
      ...groupBaseOption,
      "name": "Talkatone",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Talkatone.png"
    },
    {
      ...groupBaseOption,
      "name": "Telegram",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Telegram.png"
    },
    {
      ...groupBaseOption,
      "name": "Twitter",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Twitter.png"
    },
    {
      ...groupBaseOption,
      "name": "Instagram",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Instagram.png"
    },
    {
      ...groupBaseOption,
      "name": "Cloudflare",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Cloudflare.webp"
    },
    {
      ...groupBaseOption,
      "name": "Google",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Google.png"
    },
    {
      ...groupBaseOption,
      "name": "微软",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Microsoft.png"
    },
    {
      ...groupBaseOption,
      "name": "游戏平台",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Steam.png"
    },
    // 地区分组
    {
      ...groupBaseOption,
      "name": "香港节点",
      "type": "select",
      "proxies": ["香港节点-自动选择", "香港节点-自动回退", "香港节点-负载均衡"],
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong|HongKong)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "香港节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong|HongKong)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "香港节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong|HongKong)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "香港节点-负载均衡",
      "type": "load-balance",
      "strategy": "consistent-hashing",
      "hidden": true,
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong|HongKong)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "澳门节点",
      "type": "select",
      "proxies": ["澳门节点-自动选择", "澳门节点-自动回退", "澳门节点-负载均衡"],
      "filter": "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b",
      "icon": "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000"
    },
    {
      ...groupBaseOption,
      "name": "澳门节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b",
      "icon": "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000"
    },
    {
      ...groupBaseOption,
      "name": "澳门节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b",
      "icon": "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000"
    },
    {
      ...groupBaseOption,
      "name": "澳门节点-负载均衡",
      "type": "load-balance",
      "strategy": "consistent-hashing",
      "hidden": true,
      "filter": "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b",
      "icon": "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000"
    },
    {
      ...groupBaseOption,
      "name": "台湾节点",
      "type": "select",
      "proxies": ["台湾节点-自动选择", "台湾节点-自动回退", "台湾节点-负载均衡"],
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    },
    {
      ...groupBaseOption,
      "name": "台湾节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    },
    {
      ...groupBaseOption,
      "name": "台湾节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    },
    {
      ...groupBaseOption,
      "name": "台湾节点-负载均衡",
      "type": "load-balance",
      "hidden": true,
      "strategy": "consistent-hashing",
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    },
    {
      ...groupBaseOption,
      "name": "日本节点",
      "type": "select",
      "proxies": ["日本节点-自动选择", "日本节点-自动回退", "日本节点-负载均衡"],
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "日本节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "日本节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "日本节点-负载均衡",
      "type": "load-balance",
      "hidden": true,
      "strategy": "consistent-hashing",
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "新加坡节点",
      "type": "select",
      "proxies": ["新加坡节点-自动选择", "新加坡节点-自动回退", "新加坡节点-负载均衡"],
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "新加坡节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "新加坡节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "新加坡节点-负载均衡",
      "type": "load-balance",
      "hidden": true,
      "strategy": "consistent-hashing",
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "美国节点",
      "type": "select",
      "proxies": ["美国节点-自动选择", "美国节点-自动回退", "美国节点-负载均衡"],
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States|America)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "美国节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States|America)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "美国节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States|America)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "美国节点-负载均衡",
      "type": "load-balance",
      "hidden": true,
      "strategy": "consistent-hashing",
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States|America)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "尼日利亚节点",
      "type": "select",
      "proxies": ["尼日利亚节点-自动选择", "尼日利亚节点-自动回退", "尼日利亚节点-负载均衡"],
      "filter": "(?i)🇳🇬|尼日利亚|(\b(NG|Nigeria)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Nigeria.png"
    },
    {
      ...groupBaseOption,
      "name": "尼日利亚节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇳🇬|尼日利亚|(\b(NG|Nigeria)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Nigeria.png"
    },
    {
      ...groupBaseOption,
      "name": "尼日利亚节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇳🇬|尼日利亚|(\b(NG|Nigeria)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Nigeria.png"
    },
    {
      ...groupBaseOption,
      "name": "尼日利亚节点-负载均衡",
      "type": "load-balance",
      "hidden": true,
      "strategy": "consistent-hashing",
      "filter": "(?i)🇳🇬|尼日利亚|(\b(NG|Nigeria)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Nigeria.png"
    },
    {
      ...groupBaseOption,
      "name": "马来西亚节点",
      "type": "select",
      "proxies": ["马来西亚节点-自动选择", "马来西亚节点-自动回退", "马来西亚节点-负载均衡"],
      "filter": "(?i)🇲🇾|马来西亚|(\b(MY|Malaysia)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png"
    },
    {
      ...groupBaseOption,
      "name": "马来西亚节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇲🇾|马来西亚|(\b(MY|Malaysia)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png"
    },
    {
      ...groupBaseOption,
      "name": "马来西亚节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇲🇾|马来西亚|(\b(MY|Malaysia)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png"
    },
    {
      ...groupBaseOption,
      "name": "马来西亚节点-负载均衡",
      "type": "load-balance",
      "strategy": "consistent-hashing",
      "hidden": true,
      "filter": "(?i)🇲🇾|马来西亚|(\b(MY|Malaysia)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png"
    },
    {
      ...groupBaseOption,
      "name": "英国节点",
      "type": "select",
      "proxies": ["英国节点-自动选择", "英国节点-自动回退", "英国节点-负载均衡"],
      "filter": "(?i)🇬🇧|英国|(\b(UK|United Kingdom)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png"
    },
    {
      ...groupBaseOption,
      "name": "英国节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇬🇧|英国|(\b(UK|United Kingdom)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png"
    },
    {
      ...groupBaseOption,
      "name": "英国节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇬🇧|英国|(\b(UK|United Kingdom)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png"
    },
    {
      ...groupBaseOption,
      "name": "英国节点-负载均衡",
      "type": "load-balance",
      "strategy": "consistent-hashing",
      "hidden": true,
      "filter": "(?i)🇬🇧|英国|(\b(UK|United Kingdom)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png"
    },
    {
      ...groupBaseOption,
      "name": "德国节点",
      "type": "select",
      "proxies": ["德国节点-自动选择", "德国节点-自动回退", "德国节点-负载均衡"],
      "filter": "(?i)🇩🇪|德国|(\b(DE|Germany)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png"
    },
    {
      ...groupBaseOption,
      "name": "德国节点-自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?i)🇩🇪|德国|(\b(DE|Germany)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png"
    },
    {
      ...groupBaseOption,
      "name": "德国节点-自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?i)🇩🇪|德国|(\b(DE|Germany)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png"
    },
    {
      ...groupBaseOption,
      "name": "德国节点-负载均衡",
      "type": "load-balance",
      "hidden": true,
      "strategy": "consistent-hashing",
      "filter": "(?i)🇩🇪|德国|(\b(DE|Germany)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png"
    },
    {
      ...groupBaseOption,
      "name": "全部节点",
      "proxies": ["自动选择", "负载均衡",  "自动回退", "DIRECT"],
      "type": "select",
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    {
      ...groupBaseOption,
      "name": "自动选择",
      "type": "url-test",
      "hidden": true,
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|可用|剩余|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    {
      ...groupBaseOption,
      "name": "自动回退",
      "type": "fallback",
      "hidden": true,
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|可用|剩余|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    {
      ...groupBaseOption,
      "name": "负载均衡",
      "type": "load-balance",
      "hidden": true,
      "strategy": "consistent-hashing",
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|可用|剩余|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    }   
  ];

  // 覆盖规则集
  config["rule-providers"] = {
        "115": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/115/115_OCD_Domain.mrs",
            "path": "./ruleset/115_Domain.mrs"
        },
        "CN": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/Kwisma/clash-rules@release/direct.mrs",
            "path": "./ruleset/CN_Domain.mrs"
        },
        "Private": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/private.mrs",
            "path": "./ruleset/Private_Domain.mrs"
        },
        "Fakeip_Filter": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/fakeip-filter.mrs",
            "path": "./ruleset/Fakeip_Filter_Domain.mrs"
        },
        "ChinaMedia": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ChinaMedia/ChinaMedia_OCD_Domain.mrs",
            "path": "./ruleset/ChinaMedia_Domain.mrs"
        },
        "ChinaMedia-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ChinaMedia/ChinaMedia_OCD_IP.mrs",
            "path": "./ruleset/ChinaMedia_IP.mrs"
        },
        "NetEase": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/NetEase/NetEase_OCD_Domain.mrs",
            "path": "./ruleset/NetEase_Domain.mrs"
        },
        "NetEase-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/NetEase/NetEase_OCD_IP.mrs",
            "path": "./ruleset/NetEase_IP.mrs"
        },
        "OpenAI": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OpenAI/OpenAI_OCD_Domain.mrs",
            "path": "./ruleset/OpenAI_Domain.mrs"
        },
        "OpenAI-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OpenAI/OpenAI_OCD_IP.mrs",
            "path": "./ruleset/OpenAI_IP.mrs"
        },
        "GitHub": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GitHub/GitHub_OCD_Domain.mrs",
            "path": "./ruleset/GitHub_Domain.mrs"
        },
        "gaode": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GaoDe/GaoDe_OCD_Domain.mrs",
            "path": "./ruleset/GaoDe_Domain.mrs"
        },
        "Baidu": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Baidu/Baidu_OCD_Domain.mrs",
            "path": "./ruleset/Baidu_Domain.mrs"
        },
        "Bing": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Bing/Bing_OCD_Domain.mrs",
            "path": "./ruleset/Bing_Domain.mrs"
        },
        "ByteDance": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ByteDance/ByteDance_OCD_Domain.mrs",
            "path": "./ruleset/ByteDance_Domain.mrs"
        },
        "ByteDance-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ByteDance/ByteDance_OCD_IP.mrs",
            "path": "./ruleset/ByteDance_IP.mrs"
        },
        "Claude": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Claude/Claude_OCD_Domain.mrs",
            "path": "./ruleset/Claude_Domain.mrs"
        },
        "Copilot": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Copilot/Copilot_OCD_Domain.mrs",
            "path": "./ruleset/Copilot_Domain.mrs"
        },
        "Copilot-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Copilot/Copilot_OCD_IP.mrs",
            "path": "./ruleset/Copilot_IP.mrs"
        },
        "DingTalk": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/DingTalk/DingTalk_OCD_Domain.mrs",
            "path": "./ruleset/DingTalk_Domain.mrs"
        },
        "DouYin": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/DouYin/DouYin_OCD_Domain.mrs",
            "path": "./ruleset/DouYin_Domain.mrs"
        },
        "Epic": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Epic/Epic_OCD_Domain.mrs",
            "path": "./ruleset/Epic_Domain.mrs"
        },
        "Gemini": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Gemini/Gemini_OCD_Domain.mrs",
            "path": "./ruleset/Gemini_Domain.mrs"
        },
        "GoogleFCM": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleFCM/GoogleFCM_OCD_Domain.mrs",
            "path": "./ruleset/GoogleFCM_Domain.mrs"
        },
        "GoogleFCM-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleFCM/GoogleFCM_OCD_IP.mrs",
            "path": "./ruleset/GoogleFCM_IP.mrs"
        },
        "Instagram": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Instagram/Instagram_OCD_Domain.mrs",
            "path": "./ruleset/Instagram_Domain.mrs"
        },
        "Microsoft": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Microsoft/Microsoft_OCD_Domain.mrs",
            "path": "./ruleset/Microsoft_Domain.mrs"
        },
        "MicrosoftEdge": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/MicrosoftEdge/MicrosoftEdge_OCD_Domain.mrs",
            "path": "./ruleset/MicrosoftEdge_Domain.mrs"
        },
        "Speedtest": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Speedtest/Speedtest_OCD_Domain.mrs",
            "path": "./ruleset/Speedtest_Domain.mrs"
        },
        "Steam": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Steam/Steam_OCD_Domain.mrs",
            "path": "./ruleset/Steam_Domain.mrs"
        },
        "SteamCN": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/SteamCN/SteamCN_OCD_Domain.mrs",
            "path": "./ruleset/SteamCN_Domain.mrs"
        },
        "Teams": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Teams/Teams_OCD_Domain.mrs",
            "path": "./ruleset/Teams_Domain.mrs"
        },
        "Tencent": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Tencent/Tencent_OCD_Domain.mrs",
            "path": "./ruleset/Tencent_Domain.mrs"
        },
        "Tencent-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Tencent/Tencent_OCD_IP.mrs",
            "path": "./ruleset/Tencent_IP.mrs"
        },
        "Emby": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Emby/Emby_OCD_Domain.mrs",
            "path": "./ruleset/Emby_Domain.mrs"
        },
        "BiliBili": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BiliBili/BiliBili_OCD_Domain.mrs",
            "path": "./ruleset/BiliBili_Domain.mrs"
        },
        "BiliBili-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BiliBili/BiliBili_OCD_IP.mrs",
            "path": "./ruleset/BiliBili_IP.mrs"
        },
        "YouTube": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/YouTube/YouTube_OCD_Domain.mrs",
            "path": "./ruleset/YouTube_Domain.mrs"
        },
        "YouTube-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/YouTube/YouTube_OCD_IP.mrs",
            "path": "./ruleset/YouTube_IP.mrs"
        },
        "GlobalMedia": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GlobalMedia/GlobalMedia_OCD_Domain.mrs",
            "path": "./ruleset/Media_Domain.mrs"
        },
        "GlobalMedia-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GlobalMedia/GlobalMedia_OCD_IP.mrs",
            "path": "./ruleset/Media_IP.mrs"
        },
        "BlockHttpDNS": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BlockHttpDNS/BlockHttpDNS_OCD_Domain.mrs",
            "path": "./ruleset/Category_httpdns_Domain.mrs"
        },
        "BlockHttpDNS-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BlockHttpDNS/BlockHttpDNS_OCD_IP.mrs",
            "path": "./ruleset/Category_httpdns_IP.mrs"
        },
        "Private-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/private.mrs",
            "path": "./ruleset/Private_IP.mrs"
        },
        "Cloudflare": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/cloudflare.mrs",
            "path": "./ruleset/Cloudflare_Domain.mrs"
        },
        "Cloudflare-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/cloudflare.mrs",
            "path": "./ruleset/Cloudflare_IP.mrs"
        },
        "Telegram": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/telegram.mrs",
            "path": "./ruleset/Telegram_Domain.mrs"
        },
        "Telegram-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/telegram.mrs",
            "path": "./ruleset/Telegram_IP.mrs"
        },
        "Twitter": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/twitter.mrs",
            "path": "./ruleset/Twitter_Domain.mrs"
        },
        "Twitter-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/twitter.mrs",
            "path": "./ruleset/Twitter_IP.mrs"
        },
        "Netflix": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/netflix.mrs",
            "path": "./ruleset/Netflix_Domain.mrs"
        },
        "Netflix-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/netflix.mrs",
            "path": "./ruleset/Netflix_IP.mrs"
        },
        "Google": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/google.mrs",
            "path": "./ruleset/Google_Domain.mrs"
        },
        "Google-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/google.mrs",
            "path": "./ruleset/Google_IP.mrs"
        },
        "CN-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/Kwisma/clash-rules@release/cncidr.mrs",
            "path": "./ruleset/CN_IP.mrs"
        },
        "WeChat": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/WeChat/WeChat_Domain.mrs",
            "path": "./ruleset/WeChat_Domain.mrs"
        },
        "Talkatone": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/qljsyph/ruleset-icon@main/mihomo/domain/talkatone.mrs",
            "path": "./ruleset/Talkatone_Domain.mrs"
        },
        "Talkatone-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/qljsyph/ruleset-icon@main/mihomo/ipcidr/talkatone-ip.mrs",
            "path": "./ruleset/Talkatone_IP.mrs"
        },
        "TikTok": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/TikTok/TikTok_Domain.mrs",
            "path": "./ruleset/TikTok_Domain.mrs"
        },
        "STUN": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
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
            "RULE-SET,DouYin,DIRECT",
            "DOMAIN,ghfast.top,DIRECT",
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
            "OR,((RULE-SET,TikTok),(DOMAIN-KEYWORD,tiktok)),TikTok",
            "OR,((RULE-SET,YouTube),(DOMAIN-KEYWORD,youtube)),YouTube",
            "OR,((RULE-SET,Telegram),(DOMAIN-KEYWORD,nicegram)),Telegram",
            "OR,((RULE-SET,GitHub),(DOMAIN-KEYWORD,github)),GitHub",
            "OR,((RULE-SET,Instagram),(DOMAIN-KEYWORD,instagram)),Instagram",
            "OR,((RULE-SET,Claude),(RULE-SET,OpenAI),(RULE-SET,Gemini),(AND,((RULE-SET,Copilot),(NOT,((DOMAIN,www.bing.com))))),(DOMAIN-KEYWORD,openai),(DOMAIN-KEYWORD,openaicom-api),(DOMAIN-KEYWORD,colab),(DOMAIN-KEYWORD,developerprofiles),(DOMAIN-KEYWORD,generativelanguage)),AI",
            "OR,((RULE-SET,Speedtest),(DOMAIN-KEYWORD,speedtest)),Speedtest",
            "OR,((RULE-SET,Steam),(DOMAIN-KEYWORD,steambroadcast),(DOMAIN-KEYWORD,steamstore),(DOMAIN-KEYWORD,steamuserimages)),游戏平台",
            "RULE-SET,Epic,游戏平台",
            "RULE-SET,GoogleFCM,FCM",
            "OR,((RULE-SET,Emby,Emby),(DOMAIN-KEYWORD,emby)),Emby",
            "RULE-SET,Talkatone,Talkatone",
            "OR,((RULE-SET,Twitter),(DOMAIN-KEYWORD,twitter)),Twitter",
            "RULE-SET,Netflix,Netflix",
            "RULE-SET,Google,Google",
            "RULE-SET,GlobalMedia,国际媒体",
            "RULE-SET,Cloudflare,Cloudflare",
            "OR,((RULE-SET,Bing),(RULE-SET,Teams),(RULE-SET,MicrosoftEdge),(RULE-SET,Microsoft),(DOMAIN-KEYWORD,microsoft),(DOMAIN-KEYWORD,skydrive)),微软",
            "RULE-SET,ChinaMedia,国内媒体",
        ],
        "SUB-IP": [
            "RULE-SET,BiliBili-ip,哔哩哔哩,no-resolve",
            "RULE-SET,ChinaMedia-ip,国内媒体,no-resolve",
            "RULE-SET,Telegram-ip,Telegram,no-resolve",
            "RULE-SET,Copilot-ip,AI,no-resolve",
            "RULE-SET,OpenAI-ip,AI,no-resolve",
            "RULE-SET,GoogleFCM-ip,FCM,no-resolve",
            "RULE-SET,Talkatone-ip,Talkatone,no-resolve",
            "RULE-SET,Twitter-ip,Twitter,no-resolve",
            "RULE-SET,Netflix-ip,Netflix,no-resolve",
            "RULE-SET,Google-ip,Google,no-resolve",
            "RULE-SET,YouTube-ip,YouTube,no-resolve",
            "RULE-SET,GlobalMedia-ip,国际媒体,no-resolve",
            "RULE-SET,Cloudflare-ip,Cloudflare,no-resolve"
        ]
  };

  // 返回修改后的配置
  return config;
};