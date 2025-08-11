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
      "name": "亚马逊电商",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/AmazonPrimeVideo.webp"
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
      "name": "TVB",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/TVB.webp"
    },
    {
      ...groupBaseOption,
      "name": "AbemaTV",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Abema.webp"
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
      "name": "Disney+",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Disney+.png"
    },
    {
      ...groupBaseOption,
      "name": "AppleTV",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/AppleTV.png"
    },
    {
      ...groupBaseOption,
      "name": "Twitch",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/Twitch.webp"
    },
    {
      ...groupBaseOption,
      "name": "亚马逊TV",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/AmazonPrimeVideo.png"
    },
    {
      ...groupBaseOption,
      "name": "HBO",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/HBO.png"
    },
    {
      ...groupBaseOption,
      "name": "Hulu",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Hulu.png"
    },
    {
      ...groupBaseOption,
      "name": "ニコニコ",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Niconico.webp"
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
      "name": "IMDB",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/IMDB.webp"
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
      "name": "哔哩东南亚",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Biliintl.png"
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
      "name": "Discord",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Discord.png"
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
      "name": "巴哈姆特",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Bahamut.png"
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
      "name": "Spotify",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Spotify.png"
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
      "name": "Docker",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Docker.webp"
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
      "name": "PayPal",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/PayPal.png"
    },
    {
      ...groupBaseOption,
      "name": "PikPak",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/PikPak.webp"
    },
    {
      ...groupBaseOption,
      "name": "YouTubeMusic",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/YouTubeMusic.webp"
    },
    {
      ...groupBaseOption,
      "name": "Apple音乐",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/AppleMusic.webp"
    },
    {
      ...groupBaseOption,
      "name": "iCloud",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/iCloud.webp"
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
      "name": "GoogleVoice",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/GoogleVoice.png"
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
      "name": "Facebook",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Facebook.webp"
    },
    {
      ...groupBaseOption,
      "name": "LINE",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/Line.webp"
    },
    {
      ...groupBaseOption,
      "name": "Signal",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/Signal.webp"
    },
    {
      ...groupBaseOption,
      "name": "Wise",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Wise.png"
    },
    {
      ...groupBaseOption,
      "name": "BT追踪器",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/cf-worker-mihomo@main/icon/webp/100/BitTorrent.webp"
    },
    {
      ...groupBaseOption,
      "name": "维基百科",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Wikipedia.webp"
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
      "name": "Apple",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Apple.png"
    },
    {
      ...groupBaseOption,
      "name": "AppleCN",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/AppleCN.webp"
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
      "name": "OneDrive",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/OneDrive.webp"
    },
    {
      ...groupBaseOption,
      "name": "Adobe",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Adobe.webp"
    },
    {
      ...groupBaseOption,
      "name": "游戏平台",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/jokjit/mihomo-rules@main/icon/Steam.png"
    },
    {
      ...groupBaseOption,
      "name": "禁漫天堂",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/18comic.webp"
    },
    {
      ...groupBaseOption,
      "name": "哔咔哔咔",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Picacg.webp"
    },
    {
      ...groupBaseOption,
      "name": "Pixiv",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Pixiv.webp"
    },
    {
      ...groupBaseOption,
      "name": "Google学术",
      "type": "select",
      "proxies": ["节点选择","香港节点", "台湾节点", "日本节点", "新加坡节点", "美国节点", "全部节点", "负载均衡", "自动选择", "自动回退", "DIRECT", "尼日利亚节点", "马来西亚节点", "英国节点", "德国节点"],
      "icon": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/icon/webp/100/Scholar.webp"
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
        "Apple": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Apple/Apple_OCD_Domain.mrs",
            "path": "./ruleset/Apple_Domain.mrs"
        },
        "Apple-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Apple/Apple_OCD_IP.mrs",
            "path": "./ruleset/Apple_IP.mrs"
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
        "PikPak": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/PikPak/PikPak_OCD_Domain.mrs",
            "path": "./ruleset/PikPak_Domain.mrs"
        },
        "YouTubeMusic": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/YouTubeMusic/YouTubeMusic_OCD_Domain.mrs",
            "path": "./ruleset/YouTubeMusic_Domain.mrs"
        },
        "Discord": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Discord/Discord_OCD_Domain.mrs",
            "path": "./ruleset/Discord_Domain.mrs"
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
        "Bahamut": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Bahamut/Bahamut_OCD_Domain.mrs",
            "path": "./ruleset/Bahamut_Domain.mrs"
        },
        "Hulu": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Hulu/Hulu_OCD_Domain.mrs",
            "path": "./ruleset/Hulu_Domain.mrs"
        },
        "TVB": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/TVB/TVB_OCD_Domain.mrs",
            "path": "./ruleset/TVB_Domain.mrs"
        },
        "Niconico": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Niconico/Niconico_OCD_Domain.mrs",
            "path": "./ruleset/Niconico_Domain.mrs"
        },
        "AbemaTV": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AbemaTV/AbemaTV_OCD_Domain.mrs",
            "path": "./ruleset/AbemaTV_Domain.mrs"
        },
        "Adobe": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Adobe/Adobe_OCD_Domain.mrs",
            "path": "./ruleset/Adobe_Domain.mrs"
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
        "Amazon": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Amazon/Amazon_OCD_Domain.mrs",
            "path": "./ruleset/Amazon_Domain.mrs"
        },
        "Amazon-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Amazon/Amazon_OCD_IP.mrs",
            "path": "./ruleset/Amazon_IP.mrs"
        },
        "AmazonPrimeVideo": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AmazonPrimeVideo/AmazonPrimeVideo_OCD_Domain.mrs",
            "path": "./ruleset/AmazonPrimeVideo_Domain.mrs"
        },
        "AppleDev": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleDev/AppleDev_OCD_Domain.mrs",
            "path": "./ruleset/AppleDev_Domain.mrs"
        },
        "AppleFirmware": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleFirmware/AppleFirmware_OCD_Domain.mrs",
            "path": "./ruleset/AppleFirmware_Domain.mrs"
        },
        "AppleHardware": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleHardware/AppleHardware_OCD_Domain.mrs",
            "path": "./ruleset/AppleHardware_Domain.mrs"
        },
        "AppleID": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleID/AppleID_OCD_Domain.mrs",
            "path": "./ruleset/AppleID_Domain.mrs"
        },
        "AppleMedia": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleMedia/AppleMedia_OCD_Domain.mrs",
            "path": "./ruleset/AppleMedia_Domain.mrs"
        },
        "AppleMusic": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleMusic/AppleMusic_OCD_Domain.mrs",
            "path": "./ruleset/AppleMusic_Domain.mrs"
        },
        "AppleProxy": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleProxy/AppleProxy_OCD_Domain.mrs",
            "path": "./ruleset/AppleProxy_Domain.mrs"
        },
        "AppleTV": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/AppleTV/AppleTV_OCD_Domain.mrs",
            "path": "./ruleset/AppleTV_Domain.mrs"
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
        "Blizzard": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Blizzard/Blizzard_OCD_Domain.mrs",
            "path": "./ruleset/Blizzard_Domain.mrs"
        },
        "Blizzard-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Blizzard/Blizzard_OCD_IP.mrs",
            "path": "./ruleset/Blizzard_IP.mrs"
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
        "Docker": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Docker/Docker_OCD_Domain.mrs",
            "path": "./ruleset/Docker_Domain.mrs"
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
        "EA": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/EA/EA_OCD_Domain.mrs",
            "path": "./ruleset/EA_Domain.mrs"
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
        "GoogleDrive": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleDrive/GoogleDrive_OCD_Domain.mrs",
            "path": "./ruleset/GoogleDrive_Domain.mrs"
        },
        "GoogleEarth": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleEarth/GoogleEarth_OCD_Domain.mrs",
            "path": "./ruleset/GoogleEarth_Domain.mrs"
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
        "GoogleVoice": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/GoogleVoice/GoogleVoice_OCD_Domain.mrs",
            "path": "./ruleset/GoogleVoice_Domain.mrs"
        },
        "HuluJP": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/HuluJP/HuluJP_OCD_Domain.mrs",
            "path": "./ruleset/HuluJP_Domain.mrs"
        },
        "HuluUSA": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/HuluUSA/HuluUSA_OCD_Domain.mrs",
            "path": "./ruleset/HuluUSA_Domain.mrs"
        },
        "iCloud": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/iCloud/iCloud_OCD_Domain.mrs",
            "path": "./ruleset/iCloud_Domain.mrs"
        },
        "IMDB": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/IMDB/IMDB_OCD_Domain.mrs",
            "path": "./ruleset/IMDB_Domain.mrs"
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
        "NGA": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/NGA/NGA_OCD_Domain.mrs",
            "path": "./ruleset/NGA_Domain.mrs"
        },
        "OneDrive": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/OneDrive/OneDrive_OCD_Domain.mrs",
            "path": "./ruleset/OneDrive_Domain.mrs"
        },
        "PayPal": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/PayPal/PayPal_OCD_Domain.mrs",
            "path": "./ruleset/PayPal_Domain.mrs"
        },
        "PlayStation": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/PlayStation/PlayStation_OCD_Domain.mrs",
            "path": "./ruleset/PlayStation_Domain.mrs"
        },
        "Rockstar": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Rockstar/Rockstar_OCD_Domain.mrs",
            "path": "./ruleset/Rockstar_Domain.mrs"
        },
        "Scholar": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Scholar/Scholar_OCD_Domain.mrs",
            "path": "./ruleset/Scholar_Domain.mrs"
        },
        "Siri": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Siri/Siri_OCD_Domain.mrs",
            "path": "./ruleset/Siri_Domain.mrs"
        },
        "Sony": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Sony/Sony_OCD_Domain.mrs",
            "path": "./ruleset/Sony_Domain.mrs"
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
        "Supercell": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Supercell/Supercell_OCD_Domain.mrs",
            "path": "./ruleset/Supercell_Domain.mrs"
        },
        "Supercell-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Supercell/Supercell_OCD_IP.mrs",
            "path": "./ruleset/Supercell_IP.mrs"
        },
        "SystemOTA": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/SystemOTA/SystemOTA_OCD_Domain.mrs",
            "path": "./ruleset/SystemOTA_Domain.mrs"
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
        "Pixiv": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Pixiv/Pixiv_OCD_Domain.mrs",
            "path": "./ruleset/Pixiv_Domain.mrs"
        },
        "Wikipedia": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Wikipedia/Wikipedia_OCD_Domain.mrs",
            "path": "./ruleset/Wikipedia_Domain.mrs"
        },
        "Twitch": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Twitch/Twitch_OCD_Domain.mrs",
            "path": "./ruleset/Twitch_Domain.mrs"
        },
        "Twitch-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Twitch/Twitch_OCD_IP.mrs",
            "path": "./ruleset/Twitch_IP.mrs"
        },
        "HBO": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/HBO/HBO_OCD_Domain.mrs",
            "path": "./ruleset/HBO_Domain.mrs"
        },
        "Line": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Line/Line_OCD_Domain.mrs",
            "path": "./ruleset/Line_Domain.mrs"
        },
        "Line-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Line/Line_OCD_IP.mrs",
            "path": "./ruleset/Line_IP.mrs"
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
        "Disney": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Disney/Disney_OCD_Domain.mrs",
            "path": "./ruleset/Disney_Domain.mrs"
        },
        "Spotify": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Spotify/Spotify_OCD_Domain.mrs",
            "path": "./ruleset/Spotify_Domain.mrs"
        },
        "Spotify-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/peiyingyao/Rule-for-OCD@master/rule/Clash/Spotify/Spotify_OCD_IP.mrs",
            "path": "./ruleset/Spotify_IP.mrs"
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
        "Biliintl": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/biliintl.mrs",
            "path": "./ruleset/biliintl_Domain.mrs"
        },
        "18comic": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/18comic.mrs",
            "path": "./ruleset/18comic_Domain.mrs"
        },
        "Wise": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/wise.mrs",
            "path": "./ruleset/Wise_Domain.mrs"
        },
        "Signal": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/signal.mrs",
            "path": "./ruleset/Signal_Domain.mrs"
        },
        "Picacg": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/picacg.mrs",
            "path": "./ruleset/Picacg_Domain.mrs"
        },
        "Hoyoverse": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/hoyoverse.mrs",
            "path": "./ruleset/Hoyoverse_Domain.mrs"
        },
        "Mihoyo": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/mihoyo.mrs",
            "path": "./ruleset/Mihoyo_Domain.mrs"
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
        "Facebook": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geosite/facebook.mrs",
            "path": "./ruleset/Facebook_Domain.mrs"
        },
        "Facebook-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo/geoip/facebook.mrs",
            "path": "./ruleset/Facebook_IP.mrs"
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
        "Advertising-ads": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/TG-Twilight/AWAvenue-Ads-Rule@main/Filters/AWAvenue-Ads-Rule-Clash.mrs",
            "path": "./ruleset/Ads_Domain.mrs"
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
        "Tracker": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "domain",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/Tracker/Tracker_Domain.mrs",
            "path": "./ruleset/Tracker_Domain.mrs"
        },
        "Tracker-ip": {
            ...ruleProviderCommon,
            "type": "http",
            "interval": 86400,
            "behavior": "ipcidr",
            "format": "mrs",
            "proxy": "DIRECT",
            "url": "https://cdn.jsdmirror.com/gh/Kwisma/rules@main/rules/mihomo/Tracker/Tracker_IP.mrs",
            "path": "./ruleset/Tracker_IP.mrs"
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
            "RULE-SET,Advertising-ads,REJECT-DROP",
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
            "RULE-SET,AppleMusic,Apple音乐",
            "RULE-SET,AppleTV,AppleTV",
            "RULE-SET,AppleMedia,AppleTV",
            "OR,((RULE-SET,AppleProxy),(DOMAIN-KEYWORD,smp-device),(DOMAIN-KEYWORD,testflight)),Apple",
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
            "RULE-SET,GlobalMedia,国际媒体",
            "RULE-SET,Cloudflare,Cloudflare",
            "RULE-SET,iCloud,iCloud",
            "OR,((RULE-SET,Siri),(RULE-SET,SystemOTA),(RULE-SET,AppleID),(RULE-SET,AppleDev),(RULE-SET,AppleFirmware),(RULE-SET,AppleHardware),(RULE-SET,Apple)),AppleCN",
            "OR,((RULE-SET,Tracker),(DOMAIN-KEYWORD,announce),(DOMAIN-KEYWORD,chdbits),(DOMAIN-KEYWORD,m-team),(DOMAIN-KEYWORD,torrent)),BT追踪器",
            "RULE-SET,Mihoyo,游戏平台",
            "OR,((RULE-SET,OneDrive),(DOMAIN-KEYWORD,1drv),(DOMAIN-KEYWORD,onedrive),(DOMAIN-KEYWORD,skydrive)),OneDrive",
            "OR,((RULE-SET,Bing),(RULE-SET,Teams),(RULE-SET,MicrosoftEdge),(RULE-SET,Microsoft),(DOMAIN-KEYWORD,microsoft),(DOMAIN-KEYWORD,skydrive)),微软",
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
            "RULE-SET,GlobalMedia-ip,国际媒体,no-resolve",
            "RULE-SET,Cloudflare-ip,Cloudflare,no-resolve"
        ]
  };

  // 返回修改后的配置
  return config;
};