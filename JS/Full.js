// 规则集通用配置
const ruleProviderCommon = {
};

// 策略组通用配置
const groupBaseOption = {
  "interval": 300,
  "url": "https://www.gstatic.com/generate_204",
  "max-failed-times": 3,
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
     "https://dns.alidns.com/dns-query", // 阿里DoH
    "https://doh.pub/dns-query" // 腾讯DoH，
  ];
  // 国外DNS服务器
  const foreignNameservers = [
    "https://cloudflare-dns.com/dns-query", // CloudflareDNS
    "https://8.8.4.4/dns-query#ecs=1.1.1.1/24&ecs-override=true", // GoogleDNS
    "https://208.67.222.222/dns-query#ecs=1.1.1.1/24&ecs-override=true", // OpenDNS
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
      "+.lan",
      "+.local",
      "+.msftconnecttest.com",
      "+.msftncsi.com",
      "geosite:private",
      "RULE-SET:fakeip-filter",
      "RULE-SET:cn-domain"],
    "default-nameserver": ["223.5.5.5", "1.2.4.8"],
    "nameserver": [...foreignNameservers],
    "proxy-server-nameserver": [...domesticNameservers],
    "direct-nameserver": [...domesticNameservers],
    "direct-nameserver-follow-policy": false,
    "nameserver-policy": {
      "geosite:cn": domesticNameservers
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
      "proxies": ["Proxy", "DIRECT"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png"
    },
    {
      ...groupBaseOption,
      "name": "Proxy",
      "type": "select",
      "proxies": ["HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png"
    },
    {
      ...groupBaseOption,
      "name": "AI",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/OpenAI.png"
    },
    {
      ...groupBaseOption,
      "name": "YouTube",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "Macau", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/YouTube.png"
    },
    {
      ...groupBaseOption,
      "name": "NETFLIX",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Netflix.png"
    },
    {
      ...groupBaseOption,
      "name": "Disney+",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Disney+.png"
    },
    {
      ...groupBaseOption,
      "name": "AppleTV",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/AppleTV.png"
    },
    {
      ...groupBaseOption,
      "name": "亚马逊TV",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/AmazonPrimeVideo.png"
    },
    {
      ...groupBaseOption,
      "name": "HBO",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/HBO.png"
    },
    {
      ...groupBaseOption,
      "name": "Hulu",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Hulu.png"
    },
    {
      ...groupBaseOption,
      "name": "Emby",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png"
    },
    {
      ...groupBaseOption,
      "name": "TikTok",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/TikTok.png"
    },
    {
      ...groupBaseOption,
      "name": "哔哩哔哩",
      "type": "select",
      "proxies": ["DIRECT", "HongKong", "TaiWan", "Macau"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/BiliBili.png"
    },
    {
      ...groupBaseOption,
      "name": "哔哩东南亚",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Biliintl.png"
    },
    {
      ...groupBaseOption,
      "name": "FCM",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/FCM.png"
    },
    {
      ...groupBaseOption,
      "name": "Discord",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Discord.png"
    },
    {
      ...groupBaseOption,
      "name": "国内媒体",
      "type": "select",
      "proxies": ["DIRECT", "Proxy"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/CN_Media.png"
    },
    {
      ...groupBaseOption,
      "name": "巴哈姆特",
      "type": "select",
      "proxies": ["Proxy", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Bahamut.png"
    },
    {
      ...groupBaseOption,
      "name": "国际媒体",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Pr_Media.png"
    },
    {
      ...groupBaseOption,
      "name": "Spotify",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Spotify.png"
    },
    {
      ...groupBaseOption,
      "name": "GitHub",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/GitHub.png"
    },
    {
      ...groupBaseOption,
      "name": "PayPal",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/PayPal.png"
    },
    {
      ...groupBaseOption,
      "name": "PikPak",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/PikPak.webp"
    },
    {
      ...groupBaseOption,
      "name": "Talkatone",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Talkatone.png"
    },
    {
      ...groupBaseOption,
      "name": "GoogleVoice",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/GoogleVoice.png"
    },
    {
      ...groupBaseOption,
      "name": "Telegram",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Telegram.png"
    },
    {
      ...groupBaseOption,
      "name": "Twitter",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Twitter.png"
    },
    {
      ...groupBaseOption,
      "name": "Instagram",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Instagram.png"
    },
    {
      ...groupBaseOption,
      "name": "LINE",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/Line.webp"
    },
    {
      ...groupBaseOption,
      "name": "Signal",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer"],
      "icon": "https://cdn.jsdmirror.cn/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/Signal.webp"
    },
    {
      ...groupBaseOption,
      "name": "Wise",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Wise.png"
    },
    {
      ...groupBaseOption,
      "name": "BT追踪器",
      "type": "select",
      "include-all": true,
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/BitTorrent.webp"
    },
    {
      ...groupBaseOption,
      "name": "Apple",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Apple.png"
    },
    {
      ...groupBaseOption,
      "name": "Google",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Google.png"
    },
    {
      ...groupBaseOption,
      "name": "Microsoft",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Microsoft.png"
    },
    {
      ...groupBaseOption,
      "name": "游戏平台",
      "type": "select",
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "AllServer", "DIRECT"],
      "icon": "https://cdn.jsdmirror.cn/gh/jokjit/mihomo-rules@main/icon/Steam.png"
    },
    // 地区分组
    {
      ...groupBaseOption,
      "name": "HongKong",
      "type": "select",
      "proxies": ["HK-Auto", "HK-FallBack", "HK-LoadBalance"],
      "include-all": true,
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "HK-Auto",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "HK-FallBack",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "HK-LoadBalance",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "Macau",
      "type": "select",
      "proxies": ["MO-Auto", "MO-FallBack", "MO-LoadBalance"],
      "include-all": true,
      "filter": "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b",
      "icon": "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000"
    },
    {
      ...groupBaseOption,
      "name": "MO-Auto",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b",
      "icon": "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000"
    },
    {
      ...groupBaseOption,
      "name": "MO-FallBack",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b",
      "icon": "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000"
    },
    {
      ...groupBaseOption,
      "name": "MO-LoadBalance",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇲🇴|澳门|\\b(MO|Macau)\\b",
      "icon": "https://img.icons8.com/?size=100&id=BguLeqyhWNak&format=png&color=000000"
    },
    {
      ...groupBaseOption,
      "name": "TaiWan",
      "type": "select",
      "proxies": ["TW-Auto", "TW-FallBack", "TW-LoadBalance"],
      "include-all": true,
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    },
    {
      ...groupBaseOption,
      "name": "TW-Auto",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    },
    {
      ...groupBaseOption,
      "name": "TW-FallBack",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    },
    {
      ...groupBaseOption,
      "name": "TW-LoadBalance",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇨🇳|🇹🇼|台湾|(\b(TW|Tai|Taiwan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png"
    },
    {
      ...groupBaseOption,
      "name": "Japan",
      "type": "select",
      "proxies": ["JP-Auto", "JP-FallBack", "JP-LoadBalance"],
      "include-all": true,
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "JP-Auto",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "JP-FallBack",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "JP-LoadBalance",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    },
    {
      ...groupBaseOption,
      "name": "Singapore",
      "type": "select",
      "proxies": ["SG-Auto", "SG-FallBack", "SG-LoadBalance"],
      "include-all": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "SG-Auto",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "SG-FallBack",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "SG-LoadBalance",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "America",
      "type": "select",
      "proxies": ["US-Auto", "US-FallBack", "US-LoadBalance"],
      "include-all": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "US-Auto",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "US-FallBack",
      "type": "fallback",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "US-LoadBalance",
      "type": "load-balance",
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States)\b)",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "AllServer",
      "type": "select",
      "proxies": ["All-Auto"],
      "include-all": true,
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    },
    {
      ...groupBaseOption,
      "name": "All-Auto",
      "type": "url-test",
      "tolerance": 50,
      "lazy": true,
      "include-all": true,
      "hidden": true,
      "filter": "(?=.*(.))(?!.*((?i)群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|(\b(USE|USED|TOTAL|Traffic|Expire|EMAIL|Panel|Channel|Author)\b|(\d{4}-\d{2}-\d{2}|\d+G)))).*$",
      "icon": "https://gh-proxy.com/https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    }
  ];

  // 覆盖规则集
  config["rule-providers"] = {

    //人工智能
    "OpenAI-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OpenAI/OpenAI_OCD_Domain.mrs",
      "path": "./rules/ai-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "OpenAI-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OpenAI/OpenAI_OCD_IP.mrs",
      "path": "./rules/ai-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Claude-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Claude/Claude_OCD_Domain.mrs",
      "path": "./rules/Claude-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Copilot-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Copilot/Copilot_OCD_Domain.mrs",
      "path": "./rules/Copilot-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Copilot-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Copilot/Copilot_OCD_IP.mrs",
      "path": "./rules/Copilot-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Gemini-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Gemini/Gemini_OCD_Domain.mrs",
      "path": "./rules/Gemini-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },

    //影音娱乐
    "youtube-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/youtube.mrs",
      "path": "./rules/youtube-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "netflix-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/netflix.mrs",
      "path": "./rules/netflix-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "netflix-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/netflixip.mrs",
      "path": "./rules/netflix-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "disney-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/disney.mrs",
      "path": "./rules/disney-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "emby-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdelivr.net/gh/Lanlan13-14/Rules/rules/Domain/emby.mrs",
      "path": "./rules/emby-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "emby-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdelivr.net/gh/Lanlan13-14/Rules/rules/IP/emby-ip.mrs",
      "path": "./rules/emby-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "tiktok-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/rules/mihomo/TikTok/TikTok_Domain.mrs",
      "path": "./rules/tiktok-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "bahamut-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Bahamut/Bahamut_OCD_Domain.mrs",
      "path": "./rules/bahamut-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "biliintl-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/biliintl.mrs",
      "path": "./rules/biliintl-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "bilibili-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/bilibili.mrs",
      "path": "./bilibili-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "spotify-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/spotify.mrs",
      "path": "./rules/spotify-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "spotify-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/qljsyph/ruleset-icon@main/mihomo/ipcidr/spotify-ip.mrs",
      "path": "./rules/spotify-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "github-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GitHub/GitHub_OCD_Domain.mrs",
      "path": "./rules/github-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "twitter-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/twitter.mrs",
      "path": "./rules/twitter-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "twitter-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/twitter.mrs",
      "path": "./rules/twitter-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Instagram-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Instagram/Instagram_OCD_Domain.mrs",
      "path": "./rules/Instagram-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "apple-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Apple/Apple_OCD_Domain.mrs",
      "path": "./rules/apple-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "apple-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Apple/Apple_OCD_IP.mrs",
      "path": "./rules/apple-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "google-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Google/Google_OCD_Domain.mrs",
      "path": "./rules/google-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "google-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Google/Google_OCD_IP.mrs",
      "path": "./rules/google-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "microsoft-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Microsoft/Microsoft_OCD_Domain.mrs",
      "path": "./rules/microsoft-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "AmazonPrimeVideo-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AmazonPrimeVideo/AmazonPrimeVideo_OCD_Domain.mrs",
      "path": "./rules/AmazonPrimeVideo-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "HBO-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/HBO/HBO_OCD_Domain.mrs",
      "path": "./rules/HBO-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Hulu-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Hulu/Hulu_OCD_Domain.mrs",
      "path": "./rules/Hulu-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "AppleTV-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleTV/AppleTV_OCD_Domain.mrs",
      "path": "./rules/AppleTV-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },

    //游戏平台
    "steam-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Steam/Steam_OCD_Domain.mrs",
      "path": "./rules/steam-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "steamcn-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/SteamCN/SteamCN_OCD_Domain.mrs",
      "path": "./rules/steamcn-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "ea-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/EA/EA_OCD_Domain.mrs",
      "path": "./rules/ea-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "epic-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Epic/Epic_OCD_Domain.mrs",
      "path": "./rules/epic-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Rockstar-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Supercell/Supercell_OCD_Domain.mrs",
      "path": "./rules/Rockstar-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Supercell-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Supercell/Supercell_OCD_Domain.mrs",
      "path": "./rules/Supercell-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Supercell-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Supercell/Supercell_OCD_IP.mrs",
      "path": "./rules/Supercell-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Sony-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Sony/Sony_OCD_Domain.mrs",
      "path": "./rules/Sony-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Blizzard-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Blizzard/Blizzard_OCD_IP.mrs",
      "path": "./rules/Blizzard-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Blizzard-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Blizzard/Blizzard_OCD_Domain.mrs",
      "path": "./rules/Blizzard-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "PlayStation-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/PlayStation/PlayStation_OCD_Domain.mrs",
      "path": "./rules/PlayStation-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },


    //聊天通讯
    "talkatone-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/qljsyph/ruleset-icon@main/mihomo/domain/talkatone.mrs",
      "path": "./rules/talkatone-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "talkatone-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/qljsyph/ruleset-icon@main/mihomo/ipcidr/talkatone-ip.mrs",
      "path": "./rules/talkatone-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "GoogleVoice-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleVoice/GoogleVoice_OCD_Domain.mrs",
      "path": "./rules/GoogleVoice-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "telegram-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Telegram/Telegram_OCD_Domain.mrs",
      "path": "./rules/telegram-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "telegram-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Telegram/Telegram_OCD_IP.mrs",
      "path": "./rules/telegram-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Line-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Line/Line_OCD_Domain.mrs",
      "path": "./rules/Line-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Line-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Line/Line_OCD_IP.mrs",
      "path": "./rules/Line-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "signal-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/signal.mrs",
      "path": "./rules/signal-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Discord-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Discord/Discord_OCD_Domain.mrs",
      "path": "./rules/Discord-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },

    //工具类
    "pikpak-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/pikpak.mrs",
      "path": "./rules/pikpak-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "PayPal-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/PayPal/PayPal_OCD_Domain.mrs",
      "path": "./rules/PayPal-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Tracker-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/rules/mihomo/Tracker/Tracker_Domain.mrs",
      "path": "./rules/Tracker-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Tracker-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/rules/mihomo/Tracker/Tracker_IP.mrs",
      "path": "./rules/Tracker-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Wise-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/wise.mrs",
      "path": "./rules/Wise-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "FCM-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleFCM/GoogleFCM_OCD_Domain.mrs",
      "path": "./rules/FCM-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "FCM-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleFCM/GoogleFCM_OCD_IP.mrs",
      "path": "./rules/FCM-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },

    //杂项
    "stun-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/rules/mihomo/STUN/STUN_Domain.mrs",
      "path": "./rules/stun-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "stun-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/rules/mihomo/STUN/STUN_IP.mrs",
      "path": "./rules/stun-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "GlobalMedia-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GlobalMedia/GlobalMedia_OCD_Domain.mrs",
      "path": "./rules/GlobalMedia-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "GlobalMedia-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GlobalMedia/GlobalMedia_OCD_IP.mrs",
      "path": "./rules/GlobalMedia-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "ChinaMedia-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ChinaMedia/ChinaMedia_OCD_Domain.mrs",
      "path": "./rules/ChinaMedia-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "ChinaMedia-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/ChinaMedia/ChinaMedia_OCD_IP.mrs",
      "path": "./rules/ChinaMedia-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "BlockHttpDNS-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BlockHttpDNS/BlockHttpDNS_OCD_Domain.mrs",
      "path": "./rules/GlobalMedia-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "BlockHttpDNS-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/BlockHttpDNS/BlockHttpDNS_OCD_IP.mrs",
      "path": "./rules/GlobalMedia-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "Advertising-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.mrs",
      "path": "./rules/Advertising-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "us-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/rules/mihomo/US/US_Domain.mrs",
      "path": "./rules/us-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "fakeip-filter": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/fakeip-filter.mrs",
      "path": "./rules/fakeip-filter-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "private-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/private.mrs",
      "path": "./rules/private-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "private-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/privateip.mrs",
      "path": "./rules/private-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "gfw-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/gfw.mrs",
      "path": "./rules/gfw-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "category-ads-all-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-ads-all.mrs",
      "path": "./rules/category-ads-all-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "geolocation-!cn-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/geolocation-!cn.mrs",
      "path": "./rules/geolocation-!cn-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "category-anticensorship-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-anticensorship.mrs",
      "path": "./rules/category-anticensorship-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "category-httpdns-cn-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/category-httpdns-cn.mrs",
      "path": "./rules/category-httpdns-cn-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "cn-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/cn.mrs",
      "path": "./rules/cn-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "cn-ip": {
      ...ruleProviderCommon,
      "behavior": "ipcidr",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/cnip.mrs",
      "path": "./rules/cn-ip.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "proxy-domain": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/DustinWin/ruleset_geodata@mihomo-ruleset/proxy.mrs",
      "path": "./rules/proxy-domain.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    },
    "direct": {
      ...ruleProviderCommon,
      "behavior": "domain",
      "url": "https://cdn.jsdmirror.com/gh/Kwisma/clash-rules@release/direct.mrs",
      "path": "./rules/direct.mrs",
      "type": "http",
      "format": "mrs",
      "interval": 86400
    }


  };

  // 覆盖规则
  config["rules"] = [
    "DOMAIN,clash.razord.top,DIRECT",
    "DOMAIN,yacd.metacubex.one,DIRECT",
    "DOMAIN,yacd.haishan.me,DIRECT",
    "DOMAIN,d.metacubex.one,DIRECT",
    "DOMAIN,board.zash.run.place,DIRECT",
    "RULE-SET,Advertising-domain,REJECT",
    "RULE-SET,category-ads-all-domain,REJECT",
    // 中国联通
    "DOMAIN-SUFFIX,ad.10010.com,REJECT",
    // 小蚕惠生活
    "DOMAIN,sdk.1rtb.net,REJECT",
    // 阿里巴巴
    "DOMAIN-SUFFIX,ut.taobao.com,REJECT",
    "DOMAIN,ems.youku.com,REJECT",
    "DOMAIN,hudong.alicdn.com,REJECT",
    "DOMAIN,ossgw.alicdn.com,REJECT",
    // 阿里云盘
    "IP-CIDR,203.107.1.1/24,REJECT,no-resolve",
    // 爱奇艺
    "DOMAIN,api.iqiyi.com,REJECT",
    // 百度
    "DOMAIN,mobads.baidu.com,REJECT",
    // 百度地图
    "DOMAIN,afd.baidu.com,REJECT",
    "DOMAIN,afdconf.baidu.com,REJECT",
    // 昌原云充
    "DOMAIN,m.adyounger.com,REJECT",
    // Clue 智库
    "DOMAIN,api.helloclue.com,REJECT",
    "DOMAIN,brahe.apptimize.com,REJECT",
    "DOMAIN,collector.clue.run,REJECT",
    "DOMAIN,images.ctfassets.net,REJECT",
    "DOMAIN,mapi.apptimize.com,REJECT",
    "DOMAIN,md-i-s.apptimize.com,REJECT",
    // 放松双眼
    "DOMAIN,adservice.sigmob.cn,REJECT",
    // 工商银行
    "DOMAIN-SUFFIX,mall.icbc.com.cn,REJECT",
    "DOMAIN,pageviewp.icbc.com.cn,REJECT",
    //什么值得买
    "DOMAIN,aaid.uyunad.com,REJECT",
    "DOMAIN,acs4baichuan.m.taobao.com,REJECT",
    "DOMAIN,adashxgc.ut.taobao.com,REJECT",
    "DOMAIN,analytics-api.smzdm.com,REJECT",
    "DOMAIN,baichuan-sdk.alicdn.com,REJECT",
    "DOMAIN,dgstatic.jd.com,REJECT",
    "DOMAIN,msg.umengcloud.com,REJECT",
    "DOMAIN,sec.umeng.com,REJECT",
    "DOMAIN,ulogs.umeng.com,REJECT",
    "DOMAIN,ynuf.aliapp.org,REJECT",
    "DOMAIN,api.zuihuimai.com,REJECT",
    // 广告联盟
    "DOMAIN-KEYWORD,asiad.byteactivity,REJECT",
    "DOMAIN-KEYWORD,pangolin-sdk-toutiao,REJECT",
    "DOMAIN-KEYWORD,pangolin.snssdk.com,REJECT",
    "DOMAIN-KEYWORD,pglstatp-toutiao,REJECT",
    "DOMAIN-KEYWORD,video-cn.snssdk.com,REJECT",
    "DOMAIN-SUFFIX,ads.linkedin.com,REJECT",
    "DOMAIN-SUFFIX,ads.vungle.com,REJECT",
    "DOMAIN-SUFFIX,adukwai.com,REJECT",
    "DOMAIN-SUFFIX,applovin.com,REJECT",
    "DOMAIN-SUFFIX,applvn.com,REJECT",
    "DOMAIN-SUFFIX,appsflyer.com,REJECT",
    "DOMAIN-SUFFIX,kuaishouzt.com,REJECT",
    "DOMAIN-SUFFIX,miaozhen.com,REJECT",
    "DOMAIN-SUFFIX,ubixioe.com,REJECT",
    "DOMAIN-SUFFIX,unityads.unity3d.com,REJECT",
    "DOMAIN-SUFFIX,v.smtcdns.com,REJECT",
    "DOMAIN,adapi.izuiyou.com,REJECT",
    "DOMAIN,adtracker.adfunlink.com,REJECT",
    "DOMAIN,dsp-x.jd.com,REJECT",
    "DOMAIN,et.tanx.com,REJECT",
    "DOMAIN,gdfp.gifshow.com,REJECT",
    "DOMAIN,init.supersonicads.com,REJECT",
    "DOMAIN,janapi.jd.com,REJECT",
    "DOMAIN,mercury-gateway.ixiaochuan.cn,REJECT",
    "DOMAIN,mon.toutiaocloud.com,REJECT",
    "DOMAIN,tangram.e.qq.com,REJECT",
    "DOMAIN,ws.tapjoyads.com,REJECT",
    // 海尔智家
    "DOMAIN-SUFFIX,ehaier.com,REJECT",
    // 建设银行
    "DOMAIN-KEYWORD,adv.ccb.com,REJECT",
    // 京东
    "DOMAIN,dns.jd.com,REJECT",
    "IP-CIDR,101.124.19.122/32,REJECT,no-resolve",
    "IP-CIDR6,2402:DB40:5100:1011::5/128,REJECT,no-resolve",
    // 酷狗音乐
    "DOMAIN,adserviceretry.kglink.cn,REJECT",
    "DOMAIN,ads.service.kugou.com,REJECT",
    "DOMAIN,adserviceretry.kugou.com,REJECT",
    // 酷我音乐
    "DOMAIN,ad.tencentmusic.com,REJECT",
    "DOMAIN,g.koowo.com,REJECT",
    "DOMAIN,mobilead.kuwo.cn,REJECT",
    "DOMAIN,rich.kuwo.cn,REJECT",
    // 蓝奏云
    "DOMAIN,statics.woozooo.com,REJECT",
    // 芒果TV
    "DOMAIN-SUFFIX,da.mgtv.com,REJECT",
    "DOMAIN,credits.bz.mgtv.com,REJECT",
    "DOMAIN,credits2.bz.mgtv.com,REJECT",
    "DOMAIN,credits3.bz.mgtv.com,REJECT",
    "DOMAIN,dflow.bz.mgtv.com,REJECT",
    "DOMAIN,encounter.bz.mgtv.com,REJECT",
    "DOMAIN,floor.bz.mgtv.com,REJECT",
    "DOMAIN,layer.bz.mgtv.com,REJECT",
    "DOMAIN,mob.bz.mgtv.com,REJECT",
    "DOMAIN,rc-topic-api.bz.mgtv.com,REJECT",
    "DOMAIN,rprain.bz.mgtv.com,REJECT",
    "DOMAIN,rprain.log.mgtv.com,REJECT",
    "DOMAIN,vip.bz.mgtv.com,REJECT",
    // 美团
    "DOMAIN,maplocatesdksnapshot.d.meituan.net,REJECT",
    "DOMAIN,metrics-picture.d.meituan.net,REJECT",
    "IP-CIDR,103.37.155.60/32,REJECT,no-resolve",
    // 美颜相机
    "DOMAIN,aaid.uyunad.com,REJECT",
    "DOMAIN,adui.tg.meitu.com,REJECT",
    // Outlook
    "DOMAIN,acdn.adnxs.com,REJECT",
    "DOMAIN,mediation.adnxs.com,REJECT",
    "DOMAIN,sin3-ib.adnxs.com,REJECT",
    // 其他
    "DOMAIN,affcpatrk.com,REJECT",
    // 数字联盟
    "DOMAIN-SUFFIX,shuzilm.cn,REJECT",
    // Speedtest
    "DOMAIN-KEYWORD,-adsystem.com,REJECT",
    "DOMAIN,ads.pubmatic.com,REJECT",
    "DOMAIN,id.hadron.ad.gt,REJECT",
    // 太平洋保险
    "DOMAIN,a.cpic.com.cn,REJECT",
    // 微信
    "DOMAIN,badjs.weixinbridge.com,REJECT",
    // 小米
    "DOMAIN,sdkconfig.ad.xiaomi.com,REJECT",
    // 迅雷 解除版权限制
    "DOMAIN,hub5btmain.v6.shub.sandai.net,REJECT",
    "DOMAIN,hub5emu.v6.shub.sandai.net,REJECT",
    "DOMAIN,hub5idx.v6.shub.sandai.net,REJECT",
    // 云闪付 开屏广告
    "DOMAIN,ads.95516.com,REJECT",
    "DOMAIN,switch.cup.com.cn,REJECT",
    // Yandex
    "DOMAIN,yandexmetrica.com,REJECT",
    // Talkatone
    "DOMAIN-SUFFIX,ads.inmobi.com,REJECT",
    "DOMAIN-SUFFIX,tappx.com,REJECT",
    "DOMAIN-SUFFIX,criteo.com,REJECT",
    "DOMAIN-SUFFIX,pubmatic.com,REJECT",
    "DOMAIN-SUFFIX,smaato.net,REJECT",
    "DOMAIN-SUFFIX,amazon-adsystem.com,REJECT",
    "DOMAIN-SUFFIX,adsappier.com,REJECT",
    "DOMAIN-SUFFIX,appier.net,REJECT",
    "DOMAIN-SUFFIX,appiersig.com,REJECT",
    "DOMAIN-SUFFIX,googleads.g.doubleclick.net,REJECT",
    "RULE-SET,BlockHttpDNS-domain,REJECT",
    "RULE-SET,BlockHttpDNS-ip,REJECT,no-resolve",
    "RULE-SET,category-httpdns-cn-domain,REJECT",
    "RULE-SET,stun-domain,REJECT",
    "DOMAIN,stun.cloudflare.com,REJECT",
    "RULE-SET,stun-ip,REJECT",
    "RULE-SET,private-domain,DIRECT",
    "RULE-SET,private-ip,DIRECT,no-resolve",
    "RULE-SET,fakeip-filter,DIRECT",
    "RULE-SET,AppleTV-domain,AppleTV",
    "RULE-SET,apple-domain,Apple",
    "RULE-SET,apple-ip,Apple,no-resolve",
    "RULE-SET,bilibili-domain,哔哩哔哩",
    "RULE-SET,biliintl-domain,哔哩东南亚",
    "RULE-SET,tiktok-domain,TikTok",
    "RULE-SET,youtube-domain,YouTube",
    "RULE-SET,disney-domain,Disney+",
    "RULE-SET,bahamut-domain,巴哈姆特",
    "RULE-SET,Hulu-domain,Hulu",
    "RULE-SET,spotify-domain,Spotify",
    "RULE-SET,pikpak-domain,PikPak",
    "RULE-SET,AmazonPrimeVideo-domain,亚马逊TV",
    "RULE-SET,Line-domain,LINE",
    "RULE-SET,Line-ip,LINE",
    "RULE-SET,spotify-ip,Spotify,no-resolve",
    "RULE-SET,Discord-domain,Discord",
    "RULE-SET,telegram-domain,Telegram",
    "RULE-SET,telegram-ip,Telegram,no-resolve",
    "RULE-SET,Claude-domain,AI",
    "RULE-SET,github-domain,GitHub",
    "RULE-SET,Instagram-domain,Instagram",
    "RULE-SET,PayPal-domain,PayPal",
    "RULE-SET,Copilot-domain,AI",
    "RULE-SET,Copilot-ip,AI,no-resolve",
    "RULE-SET,microsoft-domain,Microsoft",
    "RULE-SET,OpenAI-domain,AI",
    "RULE-SET,OpenAI-ip,AI,no-resolve",
    "RULE-SET,Blizzard-domain,游戏平台",
    "RULE-SET,steam-domain,游戏平台",
    "RULE-SET,steamcn-domain,DIRECT",
    "RULE-SET,Rockstar-domain,游戏平台",
    "RULE-SET,PlayStation-domain,游戏平台",
    "RULE-SET,epic-domain,游戏平台",
    "RULE-SET,Supercell-domain,游戏平台",
    "RULE-SET,ea-domain,游戏平台",
    "RULE-SET,Sony-domain,游戏平台",
    "RULE-SET,FCM-domain,FCM",
    "RULE-SET,FCM-ip,FCM,no-resolve",
    "RULE-SET,Gemini-domain,AI",
    "RULE-SET,HBO-domain,HBO",
    "RULE-SET,signal-domain,Signal",
    "RULE-SET,Wise-domain,Wise",
    "RULE-SET,emby-domain,Emby",
    "RULE-SET,emby-ip,Emby,no-resolve",
    "RULE-SET,talkatone-domain,Talkatone",
    "RULE-SET,talkatone-ip,Talkatone,no-resolve",
    "RULE-SET,twitter-domain,Twitter",
    "RULE-SET,twitter-ip,Twitter,no-resolve",
    "RULE-SET,google-domain,Google",
    "RULE-SET,google-ip,Google,no-resolve",
    "RULE-SET,GoogleVoice-domain,GoogleVoice",
    "RULE-SET,GlobalMedia-domain,国际媒体",
    "RULE-SET,GlobalMedia-ip,国际媒体,no-resolve",
    "RULE-SET,netflix-domain,NETFLIX",
    "RULE-SET,netflix-ip,NETFLIX,no-resolve",
    "RULE-SET,Blizzard-ip,游戏平台",
    "RULE-SET,Supercell-ip,游戏平台",
    "RULE-SET,category-anticensorship-domain,Proxy",
    "RULE-SET,geolocation-!cn-domain,Proxy",
    "RULE-SET,proxy-domain,Proxy",
    "RULE-SET,gfw-domain,Proxy",
    "RULE-SET,us-domain,Proxy",
    "RULE-SET,Tracker-domain,BT追踪器",
    "RULE-SET,Tracker-ip,BT追踪器,no-resolve",
    "RULE-SET,direct,DIRECT",
    "RULE-SET,ChinaMedia-domain,DIRECT",
    "RULE-SET,ChinaMedia-ip,DIRECT,no-resolve",
    "RULE-SET,cn-domain,DIRECT",
    "RULE-SET,cn-ip,DIRECT,no-resolve",
    "MATCH,Final"
  ];

  // 返回修改后的配置
  return config;
};
