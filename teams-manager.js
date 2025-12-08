// teams-manager.js - Общая система управления командами и результатами
class TeamManager {
    constructor() {
        this.teams = JSON.parse(localStorage.getItem('energyTeams')) || [];
        this.currentTeam = localStorage.getItem('currentEnergyTeam') || '';
        this.gameResults = JSON.parse(localStorage.getItem('energyGameResults')) || {};
    }

    // Инициализация на странице
    init() {
        this.renderTeamSelector();
        this.updateCurrentTeamDisplay();
        this.setupEventListeners();
    }

    // Рендер селектора команд
    renderTeamSelector() {
        const container = document.createElement('div');
        container.className = 'team-manager';
        container.innerHTML = `
            <div class="team-selector">
                <select id="teamSelect" class="team-select">
                    <option value="">Выберите команду...</option>
                    ${this.teams.map(team => `
                        <option value="${team.name}" ${this.currentTeam === team.name ? 'selected' : ''}>
                            ${team.name} - ${this.getTeamScore(team.name)} баллов
                        </option>
                    `).join('')}
                </select>
                <div class="team-input-group">
                    <input type="text" id="newTeamName" placeholder="Новая команда" class="team-input">
                    <button onclick="teamManager.createTeam()" class="team-btn">+</button>
                </div>
                <div class="current-team" id="currentTeamDisplay"></div>
            </div>
        `;

        // Вставляем в начало body
        const header = document.querySelector('.header');
        if (header) {
            header.parentNode.insertBefore(container, header.nextSibling);
        }

        // Добавляем стили
        this.addStyles();
    }

    // Создать новую команду
    createTeam() {
        const input = document.getElementById('newTeamName');
        const name = input.value.trim();

        if (!name) {
            this.showMessage('Введите название команды!', 'error');
            return;
        }

        if (this.teams.some(t => t.name === name)) {
            this.showMessage('Такая команда уже существует!', 'error');
            return;
        }

        const newTeam = {
            name: name,
            score: 0,
            gamesPlayed: [],
            createdAt: new Date().toISOString()
        };

        this.teams.push(newTeam);
        this.saveTeams();
        this.selectTeam(name);
        
        input.value = '';
        this.showMessage(`Команда "${name}" создана!`, 'success');
    }

    // Выбрать команду
    selectTeam(teamName) {
        this.currentTeam = teamName;
        localStorage.setItem('currentEnergyTeam', teamName);
        this.updateCurrentTeamDisplay();
        this.renderTeamSelector(); // Обновляем селектор
    }

    // Обновить отображение текущей команды
    updateCurrentTeamDisplay() {
        const display = document.getElementById('currentTeamDisplay');
        if (!display) return;

        if (this.currentTeam) {
            const team = this.teams.find(t => t.name === this.currentTeam);
            if (team) {
                display.innerHTML = `
                    <strong>Текущая команда:</strong> ${team.name} 
                    <span class="team-score">${this.getTeamScore(team.name)} баллов</span>
                `;
            }
        } else {
            display.innerHTML = '<em>Команда не выбрана</em>';
        }
    }

    // Добавить очки команде
    addScore(teamName, gameName, score) {
        const team = this.teams.find(t => t.name === teamName);
        if (!team) return;

        // Инициализируем результаты игры, если нужно
        if (!this.gameResults[gameName]) {
            this.gameResults[gameName] = {};
        }

        // Сохраняем результат для этой игры
        this.gameResults[gameName][teamName] = score;

        // Обновляем общий счёт
        team.score = (team.score || 0) + score;
        
        // Отмечаем игру как пройденную
        if (!team.gamesPlayed.includes(gameName)) {
            team.gamesPlayed.push(gameName);
        }

        this.saveTeams();
        this.saveGameResults();
        
        this.showMessage(`${teamName} получила ${score} баллов в игре "${gameName}"!`, 'success');
    }

    // Получить счёт команды
    getTeamScore(teamName) {
        const team = this.teams.find(t => t.name === teamName);
        return team ? (team.score || 0) : 0;
    }

    // Сохранить команды
    saveTeams() {
        localStorage.setItem('energyTeams', JSON.stringify(this.teams));
    }

    // Сохранить результаты игр
    saveGameResults() {
        localStorage.setItem('energyGameResults', JSON.stringify(this.gameResults));
    }

    // Показать таблицу результатов
    showResultsTable() {
        const results = this.teams
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .map(team => `
                <tr>
                    <td>${team.name}</td>
                    <td>${team.score || 0}</td>
                    <td>${team.gamesPlayed.length}</td>
                    <td>${new Date(team.createdAt).toLocaleDateString()}</td>
                </tr>
            `).join('');

        const modal = document.createElement('div');
        modal.className = 'results-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🏆 Таблица результатов</h2>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Команда</th>
                            <th>Баллы</th>
                            <th>Игр сыграно</th>
                            <th>Создана</th>
                        </tr>
                    </thead>
                    <tbody>${results}</tbody>
                </table>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Закрыть</button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Показать сообщение
    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `team-message team-message-${type}`;
        message.textContent = text;
        document.body.appendChild(message);

        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }

    // Добавить стили
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .team-manager {
                background: rgba(0, 0, 0, 0.7);
                padding: 15px 20px;
                border-radius: 0 0 15px 15px;
                margin: 0 auto 30px;
                max-width: 1200px;
                backdrop-filter: blur(10px);
                border: 1px solid #00b4db;
                border-top: none;
            }

            .team-selector {
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
                justify-content: center;
            }

            .team-select {
                padding: 8px 15px;
                border-radius: 10px;
                background: #1a1a1a;
                color: white;
                border: 2px solid #00b4db;
                min-width: 200px;
                font-size: 1em;
            }

            .team-input-group {
                display: flex;
                gap: 5px;
            }

            .team-input {
                padding: 8px 15px;
                border-radius: 10px;
                background: #1a1a1a;
                color: white;
                border: 2px solid #00ff88;
                min-width: 150px;
                font-size: 1em;
            }

            .team-btn {
                padding: 8px 20px;
                border-radius: 10px;
                background: linear-gradient(45deg, #00ff88, #00cc66);
                color: black;
                border: none;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.3s;
            }

            .team-btn:hover {
                transform: scale(1.05);
            }

            .current-team {
                padding: 8px 15px;
                background: rgba(0, 180, 219, 0.2);
                border-radius: 10px;
                border-left: 4px solid #00b4db;
            }

            .team-score {
                color: #ffdd59;
                font-weight: bold;
                margin-left: 10px;
            }

            .team-message {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                color: white;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                transition: opacity 0.3s;
            }

            .team-message-success {
                background: linear-gradient(45deg, #00cc66, #00b894);
            }

            .team-message-error {
                background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            }

            .team-message-info {
                background: linear-gradient(45deg, #00b4db, #0984e3);
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .results-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                backdrop-filter: blur(5px);
            }

            .modal-content {
                background: #1a1a2e;
                padding: 30px;
                border-radius: 20px;
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                border: 2px solid #00b4db;
            }

            .results-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }

            .results-table th {
                background: #00b4db;
                color: white;
                padding: 12px;
                text-align: left;
            }

            .results-table td {
                padding: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .results-table tr:nth-child(even) {
                background: rgba(255, 255, 255, 0.05);
            }

            .results-table tr:hover {
                background: rgba(0, 180, 219, 0.2);
            }

            .close-btn {
                padding: 10px 30px;
                background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 1em;
                margin-top: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчик выбора команды из селекта
        document.addEventListener('change', (e) => {
            if (e.target.id === 'teamSelect') {
                this.selectTeam(e.target.value);
            }
        });

        // Обработчик ввода в поле новой команды
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'newTeamName' && e.key === 'Enter') {
                this.createTeam();
            }
        });
    }
}

// Создаем глобальный экземпляр менеджера
const teamManager = new TeamManager();

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    teamManager.init();
    
    // Добавляем кнопку просмотра результатов на главную
    if (document.querySelector('.header h1')) {
        const resultsBtn = document.createElement('button');
        resultsBtn.className = 'btn btn-primary';
        resultsBtn.textContent = '🏆 Таблица результатов';
        resultsBtn.style.marginTop = '20px';
        resultsBtn.onclick = () => teamManager.showResultsTable();
        
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(resultsBtn);
        }
    }
});