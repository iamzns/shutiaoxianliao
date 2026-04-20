


document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

// 可选：禁用文本选择
document.addEventListener('selectstart', function (event) {
    event.preventDefault();
});

// 可选：禁用某些快捷键（Ctrl+U, Ctrl+S, Ctrl+Shift+I, F12 等）
document.addEventListener('keydown', function (event) {
    if (event.ctrlKey && (event.key === 'u' || event.key === 's' || event.key === 'i')) {
        event.preventDefault();
    }
    if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // 获取文章内容容器
    const articleContent = document.getElementById('write');
    const tocList = document.getElementById('tocList');
    const tocSidebar = document.getElementById('tocSidebar');
    const tocToggle = document.getElementById('tocToggle');
    const backToTop = document.getElementById('backToTop');
    const progressBar = document.getElementById('progressBar');

    // 密码验证相关元素
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPassword = document.getElementById('submitPassword');
    const errorMessage = document.getElementById('errorMessage');
    const mainContent = document.getElementById('mainContent');

    // 状态变量
    let passwordVerified = false;
    let passwordPromptShown = false;

    // 生成今日密码函数
    function getTodayPassword() {
        // 获取当前日期
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        // 格式化为YYYYMMDD
        const dateString = `${year}${month}${day}`;

        // 使用CryptoJS进行MD5加密
        const md5Hash = CryptoJS.MD5(dateString).toString();

        // 取前4位字符（包含字母和数字）
        const password = md5Hash.substring(0, 4);

        // 控制台输出（用于测试，实际应用中应删除）
        console.log('今日日期:', dateString);
        console.log('MD5加密:', md5Hash);
        console.log('今日密码:', password);

        return password;
    }

    // 显示密码弹窗
    function showPasswordModal() {
        if (!passwordVerified && !passwordPromptShown) {
            passwordModal.style.display = 'flex';
            passwordPromptShown = true;
            // 给内容添加模糊效果
            mainContent.classList.add('blur-content');
        }
    }

    // 隐藏密码弹窗
    function hidePasswordModal() {
        passwordModal.style.display = 'none';
        // 移除内容模糊效果
        mainContent.classList.remove('blur-content');
    }

    // 验证密码
    function validatePassword() {
        const input = passwordInput.value.trim();
        const todayPassword = getTodayPassword();

        if (input === todayPassword) {
            passwordVerified = true;
            hidePasswordModal();
            errorMessage.textContent = '';
            passwordInput.value = '';

            // 存储验证状态到sessionStorage
            sessionStorage.setItem('passwordVerified', 'true');
            sessionStorage.setItem('verificationDate', new Date().toDateString());

            // alert('密码验证成功！您可以继续浏览完整内容。');
        } else {
            errorMessage.textContent = '密码错误，请重新输入';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // 检查是否已经验证过
    function checkPreviousVerification() {
        const verified = sessionStorage.getItem('passwordVerified');
        const verificationDate = sessionStorage.getItem('verificationDate');
        const today = new Date().toDateString();

        if (verified === 'true' && verificationDate === today) {
            passwordVerified = true;
        }
    }

    // 提取所有h1和h2元素
    const headings = articleContent.querySelectorAll('h1, h2');

    // 为标题自动生成ID的函数
    function generateHeadingId(heading, index) {
        // 获取标题文本
        let headingText = '';
        if (heading.querySelector('span')) {
            headingText = heading.querySelector('span').textContent || heading.textContent;
        } else {
            headingText = heading.textContent;
        }

        // 清理文本，生成有效的ID
        // 1. 移除序号和标点符号
        let cleanText = headingText
            .replace(/[0-9]+\./g, '')  // 移除数字加点
            .replace(/[、.。，,：:]/g, '')  // 移除标点符号
            .trim();

        // 2. 如果是中文标题，提取关键部分
        // 这里简单处理，取前几个字符
        if (/[\u4e00-\u9fa5]/.test(cleanText)) {
            // 中文标题，取前4个字符
            cleanText = cleanText.substring(0, 4);
        } else {
            // 英文标题，取前几个单词
            const words = cleanText.split(/\s+/);
            cleanText = words.slice(0, 3).join('-');
        }

        // 3. 转换为URL友好的格式
        let id = cleanText
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u4e00-\u9fa5-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        // 4. 如果ID为空，使用默认格式
        if (!id) {
            id = `heading-${index + 1}`;
        }

        // 5. 确保ID唯一
        let originalId = id;
        let counter = 1;
        while (document.getElementById(id)) {
            id = `${originalId}-${counter}`;
            counter++;
        }

        return id;
    }

    // 为所有标题自动生成ID
    headings.forEach((heading, index) => {
        // 如果标题已经有ID，保留原有ID
        if (!heading.id) {
            heading.id = generateHeadingId(heading, index);
        }
    });

    // 生成目录
    headings.forEach(heading => {
        const listItem = document.createElement('li');
        listItem.className = 'toc-item';

        const link = document.createElement('a');
        link.href = '#' + heading.id;

        // 获取标题文本（包括span内的内容）
        let headingText = '';
        if (heading.querySelector('span')) {
            headingText = heading.querySelector('span').textContent || heading.textContent;
        } else {
            headingText = heading.textContent;
        }

        link.textContent = headingText;
        link.className = 'toc-link';

        if (heading.tagName === 'H1') {
            link.classList.add('toc-h1');
        } else if (heading.tagName === 'H2') {
            link.classList.add('toc-h2');
        }

        // 添加点击事件，平滑滚动到对应位置
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // 点击时高亮当前目录项
                document.querySelectorAll('.toc-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');

                // 平滑滚动到目标位置
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });

                // 在移动端点击后关闭目录
                if (window.innerWidth <= 1024) {
                    tocSidebar.classList.remove('open');
                }
            }
        });

        listItem.appendChild(link);
        tocList.appendChild(listItem);
    });

    // 如果没有找到任何标题，显示提示
    if (headings.length === 0) {
        const noHeadingMsg = document.createElement('li');
        noHeadingMsg.className = 'toc-item';
        noHeadingMsg.innerHTML = '<span style="color: #aaa; padding: 8px 12px; font-style: italic;">未找到h1或h2标题</span>';
        tocList.appendChild(noHeadingMsg);
    }

    // 目录开关（移动端）
    tocToggle.addEventListener('click', function () {
        tocSidebar.classList.toggle('open');
    });

    // 点击目录外区域关闭目录（移动端）
    document.addEventListener('click', function (event) {
        if (window.innerWidth <= 1024 &&
            !tocSidebar.contains(event.target) &&
            event.target !== tocToggle) {
            tocSidebar.classList.remove('open');
        }
    });

    // 返回顶部按钮
    window.addEventListener('scroll', function () {
        // 显示/隐藏返回顶部按钮
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // 更新阅读进度条
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = (window.scrollY / documentHeight) * 100;
        progressBar.style.width = scrolled + '%';

        // 检查滚动位置，如果超过50%且未验证密码，显示密码弹窗
        if (scrolled > 50 && !passwordVerified && !passwordPromptShown) {
            showPasswordModal();
        }

        // 高亮当前阅读的目录项
        let currentHeadingId = '';

        for (let i = headings.length - 1; i >= 0; i--) {
            const heading = headings[i];
            const rect = heading.getBoundingClientRect();

            if (rect.top <= 150) {
                currentHeadingId = heading.id;
                break;
            }
        }

        // 更新目录高亮状态
        document.querySelectorAll('.toc-link').forEach(link => {
            link.classList.remove('active');

            if (link.getAttribute('href') === '#' + currentHeadingId) {
                link.classList.add('active');
            }
        });
    });

    // 返回顶部按钮点击事件
    backToTop.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // 密码验证事件监听
    submitPassword.addEventListener('click', validatePassword);

    // 密码输入框回车键支持
    passwordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            validatePassword();
        }
    });

    // 初始高亮第一个目录项
    if (headings.length > 0) {
        const firstLink = document.querySelector(`.toc-link[href="#${headings[0].id}"]`);
        if (firstLink) {
            firstLink.classList.add('active');
        }
    }

    // 检查之前的验证状态
    checkPreviousVerification();

    // 页面加载完成后滚动到顶部
    window.scrollTo(0, 0);

    // 测试用：显示今日密码在控制台
    console.log('今日密码提示：', getTodayPassword());

    // 显示生成的标题ID（用于调试）
    console.log('自动生成的标题ID：');
    headings.forEach((heading, index) => {
        console.log(`标题${index + 1}: "${heading.textContent}" -> ID: "${heading.id}"`);
    });
});

// 添加窗口大小变化监听，调整目录显示
window.addEventListener('resize', function () {
    const tocSidebar = document.getElementById('tocSidebar');
    if (window.innerWidth > 1024) {
        tocSidebar.classList.remove('open');
    }
});