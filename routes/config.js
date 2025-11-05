const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const EXAMPLE_CONFIG_PATH = path.join(__dirname, '..', 'config.example.json');

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
            return { config: JSON.parse(raw), source: 'config' };
        }

        if (fs.existsSync(EXAMPLE_CONFIG_PATH)) {
            const raw = fs.readFileSync(EXAMPLE_CONFIG_PATH, 'utf8');
            return { config: JSON.parse(raw), source: 'example' };
        }
    } catch (error) {
        console.error('Failed to read config file:', error);
        throw new Error('配置文件读取失败');
    }

    return { config: {}, source: 'default' };
}

function writeConfig(data) {
    try {
        const formatted = JSON.stringify(data, null, 2);
        fs.writeFileSync(CONFIG_PATH, formatted, 'utf8');
    } catch (error) {
        console.error('Failed to write config file:', error);
        throw new Error('配置文件写入失败');
    }
}

router.get('/', (req, res) => {
    try {
        const { config, source } = loadConfig();
        res.json({
            success: true,
            data: config,
            source
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '读取配置失败'
        });
    }
});

router.put('/', (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({
            success: false,
            message: '无效的配置数据：请提供合法的 JSON 对象'
        });
    }

    try {
        writeConfig(req.body);
        const { config } = loadConfig();
        res.json({
            success: true,
            message: '配置已保存并触发热重载',
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || '保存配置失败'
        });
    }
});

module.exports = router;
