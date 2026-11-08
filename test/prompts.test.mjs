import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { createPromptReader, pathNotesText } from '../lib/host/prompts.js';

test('项目兼容分支读取失败时仍保留当前角色的长期记忆', () => {
  for (const failingStep of ['enabled', 'read']) {
    const warnings = [];
    const store = {
      sessionPersonaCardSync: () => ({ id: 'cat', body: '角色正文' }),
      readActivePersonaSync: () => { throw new Error('已绑定角色不应读取默认卡'); },
      isPersonaNone: () => false,
      personaMemoryTextSync: () => '记得你喜欢冰美式。  \n',
      projectMemoryEnabledSync: () => {
        if (failingStep === 'enabled') throw new Error('项目状态无法读取');
        return true;
      },
      projectMemoryTextSync: () => { throw new Error('项目文件无法读取'); },
    };
    const prompt = createPromptReader({
      getStore: () => store,
      config: { globalBudget: 0 },
      getCwd: () => '/work',
      logger: { warn: (...args) => warnings.push(args) },
    });
    assert.equal(prompt.contextText({ sessionId: 'session' }), '记得你喜欢冰美式。  \n');
    assert.equal(warnings.length, 1);
  }
});

/** 假 store：只提供提示词读取要用的那几个同步方法 */
function fakeStore(root) {
  return {
    paths: { root },
    sessionPersonaCardSync: () => ({ id: 'baby', body: '角色正文' }),
    readActivePersonaSync: () => { throw new Error('已绑定角色不应读取默认卡'); },
    isPersonaNone: () => false,
    personaMemoryTextSync: () => '记忆正文',
    agentPromptTextSync: () => '全局正文',
    projectMemoryEnabledSync: () => false,
    projectMemoryTextSync: () => '',
  };
}

/** 一个「主会话」assembly */
const MAIN = { agent: { session: { id: 's1', header: { delegationDepth: 0 } } } };
/** 一个「子代理」assembly（深度 1） */
const CHILD = { agent: { session: { id: 's2', header: { delegationDepth: 1 } } } };

test('pathNotesText：`~` 指向角色文件夹，并说明当前所在文件夹与换算方式', () => {
  const root = join('C:', 'data');
  const folder = join(root, 'baby');
  assert.equal(
    pathNotesText({ root, personaId: 'baby', cwd: join('C:', 'work') }),
    [
      '# 路径约定',
      '',
      '- 你当前所在的文件夹：`' + join('C:', 'work') + '`',
      '- `~` 指你自己的角色文件夹：`' + folder + '`',
      '- 遇到像 `~\\xxx` 这样的写法，按上面的约定换算成 `' + join(folder, 'xxx') + '` 再访问，不要猜别的目录。',
    ].join('\n'),
  );
  // 没有 cwd 时只给角色文件夹那两条，不留空话
  assert.equal(pathNotesText({ root, personaId: 'baby', cwd: null }).includes('你当前所在的文件夹'), false);
  // 拿不到角色文件夹就整段不给（半句话对模型没价值）
  assert.equal(pathNotesText({ root: '', personaId: 'baby', cwd: '/w' }), '');
  assert.equal(pathNotesText({}), '');
});

test('路径约定：每轮现算，store 重建（切数据根）后路径立刻跟着变', () => {
  let store = fakeStore(join('/', 'root-a'));
  const prompt = createPromptReader({ getStore: () => store, config: {}, getCwd: () => '/work' });
  assert.ok(prompt.pathsText(MAIN).includes(join('/', 'root-a', 'baby')));
  // 模拟 switchDataDir：整个 store 换成新实例，不是改字段
  store = fakeStore(join('/', 'root-b'));
  const after = prompt.pathsText(MAIN);
  assert.ok(after.includes(join('/', 'root-b', 'baby')), '新数据根必须立刻出现');
  assert.equal(after.includes(join('/', 'root-a', 'baby')), false, '旧数据根不能残留');
});

test('路径约定：空白卡不注入', () => {
  const store = { ...fakeStore('/root'), isPersonaNone: () => true };
  const prompt = createPromptReader({ getStore: () => store, config: {}, getCwd: () => '/work' });
  assert.equal(prompt.pathsText(MAIN), '');
  assert.equal(prompt.personaRaw(MAIN), '');
});

test('子代理会话：默认三段裸文本全空；开了 injectIntoSubagents 才和主会话一致', () => {
  const strict = createPromptReader({
    getStore: () => fakeStore('/root'),
    config: {},
    getCwd: () => '/work',
  });
  for (const key of ['promptRaw', 'personaRaw', 'memoryRaw', 'pathsText', 'contextText']) {
    assert.equal(strict[key](CHILD), '', key + ' 在子代理会话里必须为空');
  }
  // 主会话照常
  assert.equal(strict.personaRaw(MAIN), '角色正文');
  assert.equal(strict.memoryRaw(MAIN), '记忆正文');

  const relaxed = createPromptReader({
    getStore: () => fakeStore('/root'),
    config: { injectIntoSubagents: true },
    getCwd: () => '/work',
  });
  assert.equal(relaxed.personaRaw(CHILD), '角色正文');
  assert.ok(relaxed.pathsText(CHILD).includes(join('/', 'root', 'baby')));
});
