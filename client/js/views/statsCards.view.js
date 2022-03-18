class StatsCardsView {
    constructor() {
        this.$finishedGameStats = document.getElementById('currentFinishedGames');
        this.$inProgressGameStats = document.getElementById('currentInProgressGames');
    }

    updateFinishedGames(count) {
        this.$finishedGameStats.textContent = count;
    }

    updateInProgressGames(count) {
        this.$inProgressGameStats.textContent = count;
    }
}