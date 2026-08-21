/**
 * Sub-Store -> 官方 sing-box 完整配置生成脚本
 *
 * 参数：
 *   type       = subscription / collection
 *   name       = Sub-Store 中的订阅或组合订阅名称
 *   template   = 基础 JSON 模板的 URL
 *
 * 示例：
 * https://raw.githubusercontent.com/用户名/仓库/main/scripts/official-sing-box.js
 * #type=组合订阅&name=机场&template=https%3A%2F%2Fraw.githubusercontent.com%2F用户名%2F仓库%2Fmain%2Ftemplates%2Fsing-box.json
 */

const SCRIPT_NAME = "Official sing-box Config Builder";

const GROUPS = {
  final: "🚀 最终出站",
  manual: "✈️ 手动选择",
  update: "🔄 资源更新",
  auto: "🔁 Auto",
  cnAuto: "🔁 CN Auto",
  direct: "直连",

  hk: "🇭🇰 HK",
  tw: "🇹🇼 TW",
  jp: "🇯🇵 JP",
  sg: "🇸🇬 SG",
  us: "🇺🇸 US",
  eu: "🇪🇺 EU",
  cn: "🇨🇳 CN"
};

const REGION_RULES = {
  hk: /(?:🇭🇰|香港|港(?!口)|\bHK\b|Hong\s*Kong|HongKong)/i,

  tw: /(?:🇹🇼|台湾|臺灣|台北|臺北|\bTW\b|Taiwan|Taipei)/i,

  jp: /(?:🇯🇵|日本|东京|東京|大阪|\bJP\b|Japan|Tokyo|Osaka)/i,

  sg: /(?:🇸🇬|新加坡|狮城|獅城|\bSG\b|Singapore)/i,

  us: /(?:🇺🇸|美国|美國|洛杉矶|洛杉磯|西雅图|西雅圖|纽约|紐約|硅谷|矽谷|\bUS\b|\bUSA\b|United\s*States|America|Los\s*Angeles|Seattle|New\s*York)/i,

  eu: /(?:🇪🇺|欧洲|歐洲|欧盟|歐盟|英国|英國|德国|德國|法国|法國|荷兰|荷蘭|瑞士|瑞典|挪威|芬兰|芬蘭|丹麦|丹麥|冰岛|冰島|爱尔兰|愛爾蘭|意大利|西班牙|葡萄牙|奥地利|奧地利|比利时|比利時|波兰|波蘭|捷克|匈牙利|罗马尼亚|羅馬尼亞|希腊|希臘|乌克兰|烏克蘭|俄罗斯|俄羅斯|\bEU\b|\bUK\b|Europe|United\s*Kingdom|Germany|France|Netherlands|Switzerland|Sweden|Norway|Finland|Denmark|Iceland|Ireland|Italy|Spain|Portugal|Austria|Belgium|Poland|Czech|Hungary|Romania|Greece|Ukraine|Russia|London|Frankfurt|Amsterdam|Paris|Milan|Madrid|Zurich|Stockholm|Helsinki|Vienna|Warsaw|Moscow)/i,

  cn: /(?:🇨🇳|中国|中國|大陆|大陸|内地|內地|北京|上海|广州|廣州|深圳|杭州|南京|成都|重庆|重慶|武汉|武漢|天津|苏州|蘇州|厦门|廈門|\bCN\b|China|Chinese)/i
};

const NODE_TYPES = new Set([
  "shadowsocks",
  "vmess",
  "vless",
  "trojan",
  "hysteria",
  "hysteria2",
  "tuic",
  "anytls",
  "socks",
  "http",
  "ssh",
  "wireguard",
  "shadowtls",
  "naive"
]);

function parseArguments() {
  if (typeof $arguments === "object" && $arguments !== null) {
    return $arguments;
  }
  return {};
}

function decodeArgument(value) {
  if (value === undefined || value === null) return "";

  const text = String(value).trim();

  try {
    return decodeURIComponent(text);
  } catch (_) {
    return text;
  }
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    $httpClient.get(
      {
        url,
        headers: {
          "User-Agent": "Sub-Store/Official-sing-box-Builder",
          Accept: "application/json,text/plain,*/*"
        }
      },
      (error, response, data) => {
        if (error) {
          reject(new Error(`下载模板失败：${error}`));
          return;
        }

        const status =
          Number(response && (response.status || response.statusCode)) || 200;

        if (status < 200 || status >= 300) {
          reject(new Error(`下载模板失败：HTTP ${status}`));
          return;
        }

        if (data !== undefined && data !== null) {
          resolve(String(data));
          return;
        }

        if (response && response.body !== undefined) {
          resolve(String(response.body));
          return;
        }

        reject(new Error("模板响应内容为空"));
      }
    );
  });
}

function parseJSON(input, description) {
  if (typeof input === "object" && input !== null) {
    return input;
  }

  let text = String(input || "").trim();

  // 去除 UTF-8 BOM。
  text = text.replace(/^\uFEFF/, "");

  // 兼容 Markdown JSON 代码块。
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json|jsonc)?\s*/i, "")
      .replace(/\s*```$/, "");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${description}不是有效 JSON：${error.message}`);
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];

  for (const value of values || []) {
    if (typeof value !== "string" || !value) continue;
    if (seen.has(value)) continue;

    seen.add(value);
    result.push(value);
  }

  return result;
}

function getOutboundTag(outbound) {
  if (!outbound || typeof outbound !== "object") return "";

  return String(outbound.tag || outbound.name || "").trim();
}

function getProducedOutbounds(produced) {
  let value = produced;

  if (typeof value === "string") {
    value = parseJSON(value, "节点产物");
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value.outbounds)) {
    return value.outbounds;
  }

  if (Array.isArray(value.proxies)) {
    return value.proxies;
  }

  if (Array.isArray(value.nodes)) {
    return value.nodes;
  }

  return [];
}

function isUsableNode(outbound) {
  if (!outbound || typeof outbound !== "object") return false;

  const type = String(outbound.type || "").toLowerCase();
  const tag = getOutboundTag(outbound);

  if (!type || !tag) return false;
  if (!NODE_TYPES.has(type)) return false;

  // 大多数节点需要 server；wireguard 等特殊节点可能使用其他结构。
  if (
    !outbound.server &&
    type !== "wireguard" &&
    type !== "ssh"
  ) {
    return false;
  }

  return true;
}

function sanitizeNode(node) {
  const outbound = deepClone(node);

  outbound.tag = getOutboundTag(outbound);

  // Sub-Store 内部节点名称字段，不属于 sing-box 出站字段。
  delete outbound.name;

  // 订阅内部元数据。
  delete outbound._subName;
  delete outbound._collectionName;
  delete outbound.subName;
  delete outbound.collectionName;

  return outbound;
}

function renameDuplicateNodes(nodes, reservedTags) {
  const used = new Set(reservedTags);
  const result = [];

  for (const source of nodes) {
    const node = sanitizeNode(source);
    const originalTag = node.tag || "未命名节点";

    let tag = originalTag;
    let index = 2;

    while (used.has(tag)) {
      tag = `${originalTag} ${index}`;
      index += 1;
    }

    node.tag = tag;
    used.add(tag);
    result.push(node);
  }

  return result;
}

function matchRegion(tag, region) {
  const regex = REGION_RULES[region];
  return regex ? regex.test(String(tag || "")) : false;
}

function tagsByRegion(nodes, region) {
  return nodes
    .filter((node) => matchRegion(node.tag, region))
    .map((node) => node.tag);
}

function findOutbound(config, tag) {
  return (config.outbounds || []).find(
    (outbound) => outbound && outbound.tag === tag
  );
}

function setOutboundMembers(config, tag, members, fallback) {
  const outbound = findOutbound(config, tag);
  if (!outbound) return;

  const values = uniqueStrings(members);

  if (values.length === 0 && fallback) {
    outbound.outbounds = [fallback];
  } else {
    outbound.outbounds = values;
  }

  delete outbound.use_all_providers;
  delete outbound.use_provider;
  delete outbound.providers;
}

function appendOutboundMembers(config, tag, members) {
  const outbound = findOutbound(config, tag);
  if (!outbound) return;

  outbound.outbounds = uniqueStrings([
    ...(Array.isArray(outbound.outbounds) ? outbound.outbounds : []),
    ...members
  ]);

  delete outbound.use_all_providers;
  delete outbound.use_provider;
  delete outbound.providers;
}

function convertRouteRules(rules) {
  if (!Array.isArray(rules)) return;

  for (const rule of rules) {
    if (!rule || typeof rule !== "object") continue;

    if (
      typeof rule.outbound === "string" &&
      !rule.action
    ) {
      rule.action = "route";
    }

    if (Array.isArray(rule.rules)) {
      convertRouteRules(rule.rules);
    }
  }
}

function convertDNSRules(rules) {
  if (!Array.isArray(rules)) return;

  for (const rule of rules) {
    if (!rule || typeof rule !== "object") continue;

    if (
      typeof rule.server === "string" &&
      !rule.action
    ) {
      rule.action = "route";
    }

    if (Array.isArray(rule.rules)) {
      convertDNSRules(rule.rules);
    }
  }
}

function convertRuleSets(config) {
  const ruleSets =
    config.route && Array.isArray(config.route.rule_set)
      ? config.route.rule_set
      : [];

  for (const ruleSet of ruleSets) {
    if (!ruleSet || typeof ruleSet !== "object") continue;

    if (ruleSet.type === "remote") {
      if (!ruleSet.download_detour) {
        ruleSet.download_detour = GROUPS.update;
      }

      delete ruleSet.http_client;
    }
  }
}

function convertClashAPI(config) {
  const clashAPI =
    config.experimental &&
    config.experimental.clash_api;

  if (!clashAPI || typeof clashAPI !== "object") return;

  if (
    clashAPI.external_ui_http_client &&
    !clashAPI.external_ui_download_detour
  ) {
    clashAPI.external_ui_download_detour = GROUPS.update;
  }

  delete clashAPI.external_ui_http_client;
}

function convertInbounds(config) {
  const original = Array.isArray(config.inbounds)
    ? config.inbounds
    : [];

  const hasTun = original.some(
    (inbound) => inbound && inbound.type === "tun"
  );

  // eBPF 是 RE 分支功能，官方核心不能读取。
  const retained = original.filter(
    (inbound) => inbound && inbound.type !== "ebpf"
  );

  if (!hasTun) {
    retained.unshift({
      type: "tun",
      tag: "tun-in",
      address: [
        "172.19.0.1/30",
        "fdfe:dcba:9876::1/126"
      ],
      mtu: 9000,
      auto_route: true,
      strict_route: true,
      stack: "mixed"
    });
  }

  config.inbounds = retained;
}

function removeProviderExtensions(config) {
  delete config.providers;
  delete config.http_clients;

  for (const outbound of config.outbounds || []) {
    if (!outbound || typeof outbound !== "object") continue;

    delete outbound.use_all_providers;
    delete outbound.use_provider;
    delete outbound.providers;
  }
}

function cleanOfficialConfig(config) {
  removeProviderExtensions(config);
  convertInbounds(config);
  convertRuleSets(config);
  convertClashAPI(config);

  if (config.route) {
    // RE 分支扩展字段，官方核心不需要。
    delete config.route.default_domain_match_strategy;
    convertRouteRules(config.route.rules);
  }

  if (config.dns) {
    convertDNSRules(config.dns.rules);
  }
}

function injectNodes(config, nodes) {
  const all = nodes.map((node) => node.tag);

  const hk = tagsByRegion(nodes, "hk");
  const tw = tagsByRegion(nodes, "tw");
  const jp = tagsByRegion(nodes, "jp");
  const sg = tagsByRegion(nodes, "sg");
  const us = tagsByRegion(nodes, "us");
  const eu = tagsByRegion(nodes, "eu");
  const cn = tagsByRegion(nodes, "cn");

  /*
   * 所有原 use_all_providers 组都追加全部节点。
   * 原模板中已有的策略组引用会被保留。
   */
  const allNodeSelectors = [
    "✈️ 手动选择",
    "🤖 AI",
    "📺 BiliBili",
    "📮 GoogleFCM",
    "📱 Google",
    "✈️ Telegram",
    "📹 YouTube",
    "📺 Emby",
    "📸 Instagram",
    "🐦 Twitter",
    "🏦 WISE",
    "💵 U平台",
    "🎮 Steam",
    "🐠 漏网之鱼"
  ];

  for (const tag of allNodeSelectors) {
    appendOutboundMembers(config, tag, all);
  }

  // 全节点自动测速。
  setOutboundMembers(
    config,
    GROUPS.auto,
    all,
    GROUPS.direct
  );

  // 地区组。
  setOutboundMembers(
    config,
    GROUPS.hk,
    hk,
    GROUPS.auto
  );

  setOutboundMembers(
    config,
    GROUPS.tw,
    tw,
    GROUPS.auto
  );

  setOutboundMembers(
    config,
    GROUPS.jp,
    jp,
    GROUPS.auto
  );

  setOutboundMembers(
    config,
    GROUPS.sg,
    sg,
    GROUPS.auto
  );

  setOutboundMembers(
    config,
    GROUPS.us,
    us,
    GROUPS.auto
  );

  setOutboundMembers(
    config,
    GROUPS.eu,
    eu,
    GROUPS.auto
  );

  /*
   * 中国自动测速保留直连。
   * 如果订阅中没有中国节点，则只使用直连。
   */
  setOutboundMembers(
    config,
    GROUPS.cnAuto,
    [GROUPS.direct, ...cn],
    GROUPS.direct
  );

  /*
   * 中国 selector 保留：
   *   直连
   *   中国自动测速
   *   中国节点
   */
  setOutboundMembers(
    config,
    GROUPS.cn,
    [GROUPS.direct, GROUPS.cnAuto, ...cn],
    GROUPS.direct
  );

  // 节点出站放在策略组之后、直连出站之前。
  const directIndex = config.outbounds.findIndex(
    (outbound) => outbound && outbound.tag === GROUPS.direct
  );

  if (directIndex >= 0) {
    config.outbounds.splice(directIndex, 0, ...nodes);
  } else {
    config.outbounds.push(...nodes);
  }

  return {
    all: all.length,
    hk: hk.length,
    tw: tw.length,
    jp: jp.length,
    sg: sg.length,
    us: us.length,
    eu: eu.length,
    cn: cn.length
  };
}

async function produceNodes(type, name) {
  if (typeof produceArtifact !== "function") {
    throw new Error(
      "当前 Sub-Store 运行环境不支持 produceArtifact"
    );
  }

  const produced = await produceArtifact({
    type,
    name,
    platform: "sing-box",
    produceType: "internal"
  });

  return getProducedOutbounds(produced);
}

async function main() {
  const args = parseArguments();

  const type = decodeArgument(args.type || "collection");
  const name = decodeArgument(args.name);
  const templateURL = decodeArgument(
    args.template || args.url
  );

  if (!name) {
    throw new Error(
      "缺少 name 参数，请填写 Sub-Store 中的订阅或组合订阅名称"
    );
  }

  if (!templateURL) {
    throw new Error(
      "缺少 template 参数，请填写基础 JSON 模板的 Raw 链接"
    );
  }

  const [templateText, produced] = await Promise.all([
    httpGet(templateURL),
    produceNodes(type, name)
  ]);

  const config = parseJSON(
    templateText,
    "基础配置模板"
  );

  if (!Array.isArray(config.outbounds)) {
    throw new Error("基础模板缺少 outbounds 数组");
  }

  cleanOfficialConfig(config);

  const rawNodes = produced.filter(isUsableNode);

  if (rawNodes.length === 0) {
    throw new Error(
      "没有取得可用节点，请检查 type、name 和组合订阅内容"
    );
  }

  const reservedTags = (config.outbounds || [])
    .map(getOutboundTag)
    .filter(Boolean);

  const nodes = renameDuplicateNodes(
    rawNodes,
    reservedTags
  );

  const statistics = injectNodes(config, nodes);

  console.log(
    `[${SCRIPT_NAME}] 节点统计：${JSON.stringify(statistics)}`
  );

  return JSON.stringify(config, null, 2);
}

main()
  .then((body) => {
    $done({
      body,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  })
  .catch((error) => {
    console.log(`[${SCRIPT_NAME}] ${error.stack || error}`);

    $done({
      error: `${SCRIPT_NAME}: ${error.message || error}`
    });
  });
