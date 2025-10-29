// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    // 背景動画の設定
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // 動画の再生速度を遅くして落ち着いた雰囲気に
        heroVideo.playbackRate = 0.7;

        // 動画読み込みエラー時のフォールバック
        heroVideo.addEventListener('error', function() {
            console.log('動画の読み込みに失敗しました。背景グラデーションを表示します。');
            heroVideo.style.display = 'none';
        });
    }

    // モバイルメニューの制御
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileMenuBtn && navList) {
        mobileMenuBtn.addEventListener('click', function() {
            navList.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        // メニューリンククリック時にメニューを閉じる
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navList.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });

        // メニュー外をクリックしたら閉じる
        document.addEventListener('click', function(e) {
            if (!navList.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navList.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }

    // スクロール時のヘッダー効果
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // スムーススクロール
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // FAQアコーディオン
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');

            // すべてのFAQを閉じる
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });

            // クリックしたFAQを開く（すでに開いていた場合は閉じる）
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    // 研修パッケージタブ切り替え
    const packageTabs = document.querySelectorAll('.package-tab');
    const packageContents = document.querySelectorAll('.package-content');

    packageTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetPackage = this.getAttribute('data-package');

            // すべてのタブとコンテンツから active クラスを削除
            packageTabs.forEach(t => t.classList.remove('active'));
            packageContents.forEach(c => c.classList.remove('active'));

            // クリックされたタブとコンテンツに active クラスを追加
            this.classList.add('active');
            document.getElementById(targetPackage).classList.add('active');
        });
    });

    // スクロールアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象要素を監視
    const animateElements = document.querySelectorAll('.service-card, .plan-card, .dev-plan-card, .training-plan-card, .capability-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // お問い合わせフォームの処理
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // フォームデータを取得
            const formData = new FormData(contactForm);

            // バリデーション用のオブジェクト作成
            const formObject = {};
            formData.forEach((value, key) => {
                if (!key.startsWith('_')) {
                    formObject[key] = value;
                }
            });

            // バリデーション
            if (!validateForm(formObject)) {
                return;
            }

            // 送信ボタンを無効化
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '送信中...';

            // FormSubmitに送信（通常のフォーム送信）
            // ポップアップを表示してからフォーム送信
            showSuccessPopup('送信完了。確認次第担当よりご連絡させていただきます。');

            // 少し遅延させてからフォーム送信
            setTimeout(() => {
                contactForm.submit();
            }, 1000);
        });

        // リアルタイムバリデーション
        const requiredInputs = contactForm.querySelectorAll('input[required], textarea[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    showFieldError(this, 'この項目は必須です');
                } else if (this.type === 'email' && !isValidEmail(this.value)) {
                    showFieldError(this, '正しいメールアドレスを入力してください');
                } else {
                    clearFieldError(this);
                }
            });

            input.addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    clearFieldError(this);
                }
            });
        });
    }

    // フォームバリデーション
    function validateForm(data) {
        const requiredFields = [
            { id: 'company', name: '会社名' },
            { id: 'name', name: 'お名前' },
            { id: 'email', name: 'email' },
            { id: 'message', name: 'お問い合わせ内容' }
        ];
        let isValid = true;

        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = data[field.name];
            if (!value || value.trim() === '') {
                showFieldError(input, 'この項目は必須です');
                isValid = false;
            } else {
                clearFieldError(input);
            }
        });

        // メールアドレスの形式チェック
        if (data.email && !isValidEmail(data.email)) {
            const emailInput = document.getElementById('email');
            showFieldError(emailInput, '正しいメールアドレスを入力してください');
            isValid = false;
        }

        return isValid;
    }

    // メールアドレス形式チェック
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // フィールドエラー表示
    function showFieldError(input, message) {
        clearFieldError(input);
        input.style.borderColor = '#ef4444';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#fca5a5';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;

        input.parentNode.appendChild(errorDiv);
    }

    // フィールドエラー削除
    function clearFieldError(input) {
        input.style.borderColor = '';
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // 成功ポップアップ表示
    function showSuccessPopup(message) {
        // オーバーレイとポップアップを作成
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        `;

        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: popupSlideIn 0.3s ease-out;
        `;

        const icon = document.createElement('div');
        icon.style.cssText = `
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 2rem;
        `;
        icon.textContent = '✓';
        icon.style.color = 'white';

        const messageText = document.createElement('p');
        messageText.style.cssText = `
            font-size: 1.125rem;
            color: #1f2937;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        `;
        messageText.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '閉じる';
        closeBtn.style.cssText = `
            background: #6366f1;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = '#4f46e5';
        closeBtn.onmouseout = () => closeBtn.style.background = '#6366f1';
        closeBtn.onclick = () => overlay.remove();

        popup.appendChild(icon);
        popup.appendChild(messageText);
        popup.appendChild(closeBtn);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // オーバーレイクリックで閉じる
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // ESCキーで閉じる
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // 通知表示
    function showNotification(message, type = 'info') {
        // 既存の通知を削除
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // 5秒後に自動削除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // キーボードナビゲーション
    document.addEventListener('keydown', function(e) {
        // ESCキーでモバイルメニューとFAQを閉じる
        if (e.key === 'Escape') {
            if (navList && navList.classList.contains('active')) {
                navList.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.classList.remove('active');
                }
            }

            // すべてのFAQを閉じる
            document.querySelectorAll('.faq-item.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });

    // ページ読み込み完了時のアニメーション
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');

        // ヒーローセクションの遅延アニメーション
        const heroTitle = document.querySelector('.hero-title');
        const heroDescription = document.querySelector('.hero-description');
        const heroButtons = document.querySelector('.hero-buttons');

        if (heroTitle) {
            setTimeout(() => heroTitle.classList.add('fade-in-up'), 100);
        }
        if (heroDescription) {
            setTimeout(() => heroDescription.classList.add('fade-in-up'), 300);
        }
        if (heroButtons) {
            setTimeout(() => heroButtons.classList.add('fade-in-up'), 500);
        }
    });

    // パフォーマンス最適化：デバウンス関数
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ウィンドウリサイズ時の処理
    const debouncedResizeHandler = debounce(function() {
        // リサイズ時にモバイルメニューを閉じる
        if (window.innerWidth > 968) {
            if (navList) navList.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        }
    }, 250);

    window.addEventListener('resize', debouncedResizeHandler);
});

// CSS アニメーション用のスタイルを動的に追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes popupSlideIn {
        from {
            transform: scale(0.9) translateY(-20px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }

    .loaded .hero-title,
    .loaded .hero-description,
    .loaded .hero-buttons {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }

    .loaded .hero-title.fade-in-up,
    .loaded .hero-description.fade-in-up,
    .loaded .hero-buttons.fade-in-up {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);
