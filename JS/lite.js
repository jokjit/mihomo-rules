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

  //覆盖hosts配置
  config["hosts"] = {
    "dns.alidns.com": ["223.5.5.5", "223.6.6.6", "2400:3200::1", "2400:3200:baba::1"],
    "doh.pub": ["1.12.12.12", "1.12.12.21", "120.53.53.53"],
    "dns.google": ["8.8.8.8", "8.8.4.4", "2001:4860:4860::8888", "2001:4860:4860::8844"],
    "ntp.ntsc.ac.cn": ["114.118.7.161", "114.118.7.163"]
  };
  
  config["ntp"] = {
        "enable": false,
        "write-to-system": false,
        "server": "ntp.ntsc.ac.cn",
        "port": 123,
        "interval": 30
  };
  
  // 覆盖 dns 配置
  config["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "use-hosts": true,
    "use-system-hosts": false,
    "respect-rules": true,
    "prefer-h3": false,
    "ipv6": true,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": ["geosite:private",
            "RULE-SET:fakeip-filter",
            "RULE-SET:cn-domain"],
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    "nameserver": ["https://dns.google/dns-query#h3=true", "quic://unfiltered.adguard-dns.com", "https://doh.opendns.com/dns-query"],
    "proxy-server-nameserver": ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
    "direct-nameserver": ["quic://223.5.5.5", "quic://223.6.6.6"],
    "direct-nameserver-follow-policy": true
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
      "proxies": ["Proxy", "HongKong", "TaiWan", "Japan", "Singapore", "America", "Macau","AllServer"],
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
      "name": "Emb