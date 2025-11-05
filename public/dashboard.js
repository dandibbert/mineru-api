const statusEl = document.getElementById('status');
const editorEl = document.getElementById('config-editor');
const formEl = document.getElementById('config-form');
const formatBtn = document.getElementById('format-btn');

function setStatus(type, message) {
    statusEl.className = `status ${type}`;
    statusEl.textContent = message;
}

async function fetchConfig() {
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error(`请求失败：${response.status}`);
        }
        const payload = await response.json();
        if (!payload.success) {
            throw new Error(payload.message || '未知错误');
        }

        editorEl.value = JSON.stringify(payload.data, null, 2);
        const sourceMap = {
            config: 'config.json',
            example: 'config.example.json',
            default: '默认空配置'
        };
        setStatus('success', `配置加载成功（来源：${sourceMap[payload.source] || '未知'}）`);
    } catch (error) {
        console.error(error);
        setStatus('error', `配置加载失败：${error.message}`);
        editorEl.value = '';
    }
}

formatBtn.addEventListener('click', () => {
    try {
        if (!editorEl.value.trim()) {
            setStatus('info', '没有可格式化的配置内容');
            return;
        }
        const parsed = JSON.parse(editorEl.value);
        editorEl.value = JSON.stringify(parsed, null, 2);
        setStatus('success', '格式化完成');
    } catch (error) {
        setStatus('error', `格式化失败：${error.message}`);
    }
});

formEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        if (!editorEl.value.trim()) {
            setStatus('error', '配置内容不能为空');
            return;
        }

        const parsed = JSON.parse(editorEl.value);
        setStatus('info', '正在保存配置并触发热重载...');

        const response = await fetch('/api/config', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(parsed)
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
            throw new Error(payload.message || `保存失败：${response.status}`);
        }

        editorEl.value = JSON.stringify(payload.data, null, 2);
        setStatus('success', payload.message || '配置已保存');
    } catch (error) {
        console.error(error);
        if (error instanceof SyntaxError) {
            setStatus('error', `配置不是合法的 JSON：${error.message}`);
        } else {
            setStatus('error', error.message || '保存失败');
        }
    }
});

fetchConfig();
