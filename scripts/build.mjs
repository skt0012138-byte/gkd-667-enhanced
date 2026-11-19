import fs from 'node:fs/promises';
import JSON5 from 'json5';

const url = 'https://raw.githubusercontent.com/Lin-arm/GKD_subscription/main/dist/gkd.json5';

const res = await fetch(url);
if (!res.ok) throw new Error('上游下载失败：' + res.status);

const data = JSON5.parse(await res.text());

if (!Array.isArray(data.categories) || !Array.isArray(data.apps)) {
  throw new Error('上游订阅结构异常，停止构建');
}

// 默认开启的类别
const enabled = [
  '开屏广告',
  '局部广告',
  '全屏广告',
  '分段广告',
  '更新提示',
  '评价提示',
  '通知提示',
  '青少年模式'
];

// 修改分类默认开关
for (const category of data.categories) {
  category.enable = enabled.includes(category.name);
}

// 使用独立订阅 ID
data.id = 667001;
data.name = 'GKD 667 增强版';
data.author = 'GKD 667 Enhanced';

// 设置自己的更新地址
const repo = process.env.GITHUB_REPOSITORY;
if (!repo) throw new Error('找不到仓库地址');

data.updateUrl =
  `https://raw.githubusercontent.com/${repo}/main/dist/gkd.json5`;

await fs.mkdir('dist', { recursive: true });

await fs.writeFile(
  'dist/gkd.json5',
  JSON.stringify(data, null, 2)
);

console.log('构建成功');
console.log('应用数量：', data.apps.length);
console.log('分类数量：', data.categories.length);
console.log('开启类别：', enabled.join('、'));
