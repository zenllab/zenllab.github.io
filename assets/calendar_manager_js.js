// 달력 및 날짜 관리
const CalendarManager = {
    today: new Date(),
    currentDate: new Date(),
    selectedDate: new Date(),
    monthNames: ["January", "February", "March", "April", "May", "June", 
                 "July", "August", "September", "October", "November", "December"],
    
    elements: {
        calendarDates: () => document.getElementById('calendar-dates'),
        monthYear: () => document.getElementById('month-year'),
        prevBtn: () => document.getElementById('prev-month'),
        nextBtn: () => document.getElementById('next-month'),
        todayBtn: () => document.getElementById('today-btn'),
        todoTitle: () => document.getElementById('todo-list'),
        reportTitle: () => document.getElementById('report-title'),
        reportContent: () => document.getElementById('report-content')
    },

    init() {
        this.elements.prevBtn().addEventListener('click', () => this.prevMonth());
        this.elements.nextBtn().addEventListener('click', () => this.nextMonth());
        this.elements.todayBtn().addEventListener('click', () => this.goToToday());
    },

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        this.elements.monthYear().textContent = `${this.monthNames[month]} ${year}`;
        
        const datesEl = this.elements.calendarDates();
        datesEl.innerHTML = '';
        
        // 빈 칸 추가
        for (let i = 0; i < firstDay; i++) {
            datesEl.innerHTML += '<div></div>';
        }
        
        // 날짜 추가
        for (let i = 1; i <= lastDate; i++) {
            const dayEl = document.createElement('div');
            dayEl.textContent = i;
            dayEl.dataset.date = this.formatDate(new Date(year, month, i));
            
            if (dayEl.dataset.date === this.formatDate(this.selectedDate)) {
                dayEl.classList.add('selected-date');
            }

            dayEl.addEventListener('click', () => {
                this.selectedDate = new Date(year, month, i);
                this.updateDisplay();
                this.render();
            });
            
            datesEl.appendChild(dayEl);
        }
    },

    updateDisplay() {
        const dateKey = this.formatDate(this.selectedDate);
        this.elements.todoTitle().textContent = `Todo List - ${dateKey}`;
        this.elements.reportTitle().textContent = `Daily Report - ${dateKey}`;
        
        const isToday = this.formatDate(this.selectedDate) === this.formatDate(this.today);
        this.elements.reportContent().contentEditable = isToday ? "true" : "false";

        // 로컬 Report 데이터 로드
        const savedContent = localStorage.getItem(`report_${dateKey}`);
        if (savedContent) {
            this.elements.reportContent().innerHTML = savedContent;
        } else {
            this.elements.reportContent().innerHTML = '<p>No report for this date.</p>';
        }
        
        // Todo 데이터 로드
        if (window.TodoManager) {
            TodoManager.loadFromLocal();
        }
    },

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },

    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.updateDisplay();
        this.render();
    },

    // 자정 리셋 기능
    checkAndResetIfNewDay() {
        const today = new Date().toDateString();
        const lastVisit = localStorage.getItem('lastVisitDate');
        
        if (lastVisit !== today) {
            localStorage.setItem('lastVisitDate', today);
            const todayDate = new Date();
            
            if (this.formatDate(this.selectedDate) !== this.formatDate(todayDate)) {
                this.selectedDate = todayDate;
                this.currentDate = todayDate;
                this.updateDisplay();
                this.render();
            }
        }
    },

    setupMidnightReset() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow - now;

        setTimeout(() => {
            this.checkAndResetIfNewDay();
            this.setupMidnightReset();
        }, msUntilMidnight);
    }
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    CalendarManager.init();
});