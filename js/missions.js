// ミッションシステム - missions.js

class MissionSystem {
    constructor() {
        this.missions = [];
        this.completedMissions = new Set();
        this.initMissions();
    }

    initMissions() {
        this.missions = GAME_CONFIG.MISSIONS.map(config => {
            const progressFunc = config.progress;
            return {
                id: config.id,
                title: config.title,
                description: config.description,
                target: config.target,
                reward: config.reward,
                progressFunc: progressFunc,
                completed: false,
                progress: 0
            };
        });
    }

    updateProgress() {
        this.missions.forEach(mission => {
            const newProgress = mission.progressFunc(player);
            mission.progress = Math.min(newProgress, 1);

            // クリア判定
            if (mission.progress >= 1 && !mission.completed) {
                mission.completed = true;
                this.completedMissions.add(mission.id);
                showToast(`🎉 ミッションクリア: ${mission.title}`, "success");
            }
        });
    }

    getActiveMissions() {
        return this.missions.filter(m => !m.completed);
    }

    getCompletedCount() {
        return this.completedMissions.size;
    }

    getTotalCount() {
        return this.missions.length;
    }

    reset() {
        this.initMissions();
        this.completedMissions.clear();
    }
}

// グローバルなミッションシステム
let missionSystem = new MissionSystem();
