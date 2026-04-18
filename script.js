
// MD5加密函数（简化版，仅用于演示）
function md5(input) {
    // 简单模拟MD5函数，实际应用中应该使用完整的MD5算法
    // 这里为了演示，我们使用一个简化的版本
    // 注意：这只是一个模拟函数，实际MD5算法要复杂得多
    // 在实际项目中，建议使用成熟的MD5库，如crypto-js
    function simpleMD5(str) {
        // 这是一个简化的模拟函数，仅用于演示
        // 实际MD5算法包括复杂的位操作和循环
        // 这里我们使用一个简单的哈希函数来模拟
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }

        // 转换为16进制字符串
        let result = (hash >>> 0).toString(16);

        // 确保是32位（8个16进制字符）
        while (result.length < 8) {
            result = '0' + result;
        }

        return result;
    }

    // 对于本演示，我们使用一个更简单的模拟：
    // 实际密码生成逻辑：取当天日期，计算简单哈希，取前4位
    const today = new Date();
    const dateString = today.getFullYear() +
        String(today.getMonth() + 1).padStart(2, '0') +
        String(today.getDate()).padStart(2, '0');

    // 在实际应用中，这里应该使用完整的MD5算法
    // 但为了简化演示，我们使用一个简单的哈希
    const hash = simpleMD5(dateString);

    // 返回前4个字符
    return hash.substring(0, 4).toLowerCase();
}

// 获取今天的密码
function getTodayPassword() {
    return md5(); // 返回当天的密码
}

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// 可选：禁用文本选择
document.addEventListener('selectstart', function(event) {
    event.preventDefault();
});

// 可选：禁用某些快捷键（Ctrl+U, Ctrl+S, Ctrl+Shift+I, F12 等）
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'u' || event.key === 's' || event.key === 'i')) {
        event.preventDefault();
    }
    if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
    }
});

// 滚动检测和密码验证逻辑
document.addEventListener('DOMContentLoaded', function () {
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitBtn = document.getElementById('submitPassword');
    const errorMessage = document.getElementById('errorMessage');
    const progressBar = document.getElementById('progressBar');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    let passwordVerified = false; // 标记密码是否已验证
    const todayPassword = getTodayPassword(); // 获取今天的密码

    console.log("今天的密码是:", todayPassword); // 控制台输出密码，便于测试

    // 显示密码弹窗
    function showPasswordModal() {
        passwordModal.style.display = 'flex';
        passwordInput.focus();
    }

    // 隐藏密码弹窗
    function hidePasswordModal() {
        passwordModal.style.display = 'none';
        passwordInput.value = '';
        errorMessage.textContent = '';
    }

    // 验证密码
    function validatePassword() {
        const input = passwordInput.value.trim().toLowerCase();

        if (input === todayPassword) {
            passwordVerified = true;
            hidePasswordModal();
            // 存储验证状态到sessionStorage，避免刷新后重新验证
            sessionStorage.setItem('scrollPasswordVerified', 'true');
            return true;
        } else {
            errorMessage.textContent = '密码错误，请重新输入';
            passwordInput.value = '';
            passwordInput.focus();
            return false;
        }
    }

    // 检查滚动位置
    function checkScrollPosition() {
        if (passwordVerified) return; // 如果已验证，不再检查

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

        // 更新进度条
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';

        // 检查是否滚动超过50%
        if (scrollPercent > 50) {
            // 检查是否已经验证过（从sessionStorage）
            const storedVerified = sessionStorage.getItem('scrollPasswordVerified');
            if (storedVerified === 'true') {
                passwordVerified = true;
                return;
            }

            // 显示密码弹窗
            if (!passwordModal.style.display || passwordModal.style.display === 'none') {
                showPasswordModal();

                // 阻止继续滚动
                document.body.style.overflow = 'hidden';
            }

            // 将页面滚动回50%位置
            const targetScroll = 0.5 * (documentHeight - windowHeight);
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }

        // 更新滚动指示器
        if (scrollPercent < 1) {
            scrollIndicator.innerHTML = '<span style="display:block;text-align:center;">↓<br>向下滚动</span>';
        } else if (scrollPercent < 99) {
            scrollIndicator.innerHTML = '<span style="display:block;text-align:center;">↑↓<br>继续滚动</span>';
        } else {
            scrollIndicator.style.opacity = '0';
        }
    }

    // 添加滚动事件监听器（使用节流提高性能）
    let scrollTimeout;
    window.addEventListener('scroll', function () {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function () {
                checkScrollPosition();
                scrollTimeout = null;
            }, 100);
        }
    });

    // 密码提交按钮点击事件
    submitBtn.addEventListener('click', function () {
        if (validatePassword()) {
            document.body.style.overflow = 'auto'; // 恢复滚动
        }
    });

    // 密码输入框回车事件
    passwordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            if (validatePassword()) {
                document.body.style.overflow = 'auto'; // 恢复滚动
            }
        }
    });

    // 初始检查滚动位置
    checkScrollPosition();

    // 检查sessionStorage中是否有已验证的记录
    const storedVerified = sessionStorage.getItem('scrollPasswordVerified');
    if (storedVerified === 'true') {
        passwordVerified = true;
    }

    // 章节进入视口时的动画效果
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 将所有章节添加到观察者
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
});