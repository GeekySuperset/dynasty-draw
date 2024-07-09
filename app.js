
const UIState = {
    SCENARIOS: 'scenarios',
    CUSTOM: 'custom',
    LOADING: 'loading',
    RESULTS: 'results'
};

document.addEventListener('DOMContentLoaded', () => {
    const conferenceCheckboxes = document.querySelectorAll('input[name="conference"]');
    const prestigeCheckboxes = document.querySelectorAll('input[name="prestige"]');
    const championshipCheckboxes = document.querySelectorAll('input[name="championship"]');
    const rankCheckboxes = document.querySelectorAll('input[name="rank"]');
    const firstD1YearSelect = document.getElementById('first_d1_year');

    const customScenarioContainer = document.getElementById('custom-scenario-container');
    
    const resultContainer = document.getElementById('result-container');
    const resultTeamContainer = document.getElementById('result-team-container');
    const resultErrorContainer = document.getElementById('result-error-container');
    

    const mulliganButton = document.getElementById('mulliganButton');
    const resetButton = document.getElementById('resetButton');
    const scenariosContainer = document.getElementById('scenarios-container');
    const intakeFormContainer = document.getElementById('intake-form-container');
    const randmomizerTypeButton = document.getElementById('randomizer-type-button');
    const loadingScreen = document.getElementById('loading-screen');
    let selectedScenario = null;

    let _uiState = UIState.SCENARIOS;
    onUIStateChange(_uiState);
    loadTeams().then(teams => {
        loadScenarios(teams);
    });
    randomizeLoadingMessage();
    
    


    function loadScenarios(teams) {
        // Load scenarios from the JSON file
        fetch('data/scenarios.json')
        .then(response => response.json())
        .then(scenarios => {
            scenarios.forEach(scenario => {
                const filteredTeams = filterScenarioTeams(teams, scenario);
                const scenarioBlock = document.createElement('div');
                scenarioBlock.classList.add('scenario-block');
                scenarioBlock.innerHTML = `
                    <div class="scenario-title font-cfbheadlines">${scenario.name.toUpperCase()}</div>
                    <div class="scenario-number-of-teams font-cfbsubheading">${filteredTeams.length} Teams</div>
                    <div class="scenario-description font-cfbbody">${scenario.description}</div>
                `;
                scenarioBlock.addEventListener('click', () => {
                    selectedScenario = scenario;
                    applyScenario(scenario);
                });
                scenariosContainer.appendChild(scenarioBlock);
            });
        });
    }

    document.getElementById('randomizeButton').addEventListener('click', () => {
        applyCustomScenario();
    });

    mulliganButton.addEventListener('click', () => {
        mulliganButtonPressed()
    });

    resetButton.addEventListener('click', () => {
        resetButtonPressed();
    });

    randmomizerTypeButton.addEventListener('click', () => {
        randomizerTypeButtonPressed();
    });

    function selectRandomTeamButtonPressed() {
        applyCustomScenario();
    }

    function randomizerTypeButtonPressed() {
        if (_uiState === UIState.SCENARIOS) {
            setUIState(UIState.CUSTOM);
        } else {
            setUIState(UIState.SCENARIOS);
        }
    }

    function mulliganButtonPressed() {
        if (selectedScenario) {
            applyScenario(selectedScenario);
        } else {
            applyCustomScenario();
        }
    }

    function resetButtonPressed() {
        selectedScenario = null;
        setUIState(UIState.SCENARIOS);
    }

    function setUIState(newState) {
        _uiState = newState;
        onUIStateChange(_uiState);
    }

    function onUIStateChange(newState) {
        switch (newState) {
            case UIState.SCENARIOS:
                intakeFormContainer.classList.remove('hidden');
                scenariosContainer.classList.remove('hidden');
                customScenarioContainer.classList.add('hidden');
                resultContainer.classList.add('hidden');
                randmomizerTypeButton.textContent = 'Customize Your Scenario';
                loadingScreen.classList.add('hidden');
                break;
            case UIState.CUSTOM:
                intakeFormContainer.classList.remove('hidden');
                loadingScreen.classList.add('hidden');
                scenariosContainer.classList.add('hidden');
                customScenarioContainer.classList.remove('hidden');
                resultContainer.classList.add('hidden');
                randmomizerTypeButton.textContent = 'Pre-Built Scenarios';
                break;
            case UIState.LOADING:
                loadingScreen.classList.remove('hidden');
                intakeFormContainer.classList.add('hidden');
                resultContainer.classList.add('hidden');
                // fire a timer in 1 second to simulate loading and change the state to results
                setTimeout(() => {
                    setUIState(UIState.RESULTS);
                    randomizeLoadingMessage();
                }, 1500);
                break;
            case UIState.RESULTS:
                loadingScreen.classList.add('hidden');
                intakeFormContainer.classList.add('hidden');
                resultContainer.classList.remove('hidden');
                break;
        }
    }

    function applyScenario(scenario) {
        loadTeams().then(teams => {
            const filteredTeams = filterScenarioTeams(teams, scenario);
            const randomTeam = getRandomTeam(filteredTeams);
            displayResult(randomTeam, scenario);
        });
    }

    function applyCustomScenario() {
        loadTeams().then(teams => {
            const filteredTeams = filterTeams(teams);
            const randomTeam = getRandomTeam(filteredTeams);
            displayResult(randomTeam, null);
        });
    }

    async function loadTeams() {
        const response = await fetch('data/teams.csv');
        const data = await response.text();
        const teams = parseCSV(data);
        return teams; 
    }

    async function randomizeLoadingMessage() {
        const loadingMessage = await getRandomLoadingMessage();
        document.getElementById('loading-title').textContent = loadingMessage.title;
        document.getElementById('loading-subtitle').textContent = loadingMessage.subtitle;

    }

    async function getRandomLoadingMessage() {
        try {
            const response = await fetch('data/loading_messages.json');
            const data = await response.json();
            const loadingMessages = data.loadingMessages;
            const randomIndex = Math.floor(Math.random() * loadingMessages.length);
            return loadingMessages[randomIndex];
        } catch (error) {
            console.error('Error loading the JSON file:', error);
            return null; // or provide a default message
        }
    }

    function parseCSV(data) {
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        const mappedTeams = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((object, header, index) => {
                object[header.trim()] = values[index].trim();
                return object;
            }, {});
        });
        mappedTeams.forEach(team => {
            if (team.top_25_rank) {
                team.top_25_rank = parseInt(team.top_25_rank);
            } else {
                team.top_25_rank = 0;
            }
            team.national_championships = parseInt(team.national_championships);
            team.last_championship_year = team.last_championship_year ? parseInt(team.last_championship_year) : null;
            team.first_d1_year = parseInt(team.first_d1_year);
            team.prestige = parseInt(team.prestige);
            team.overall = team.overall ? parseInt(team.overall) : null;
            team.offense = team.offense ? parseInt(team.offense) : null;
            team.defense = team.defense ? parseInt(team.defense) : null;
            team.stadium_capacity = team.stadium_capacity ? parseInt(team.stadium_capacity) : null;
        });
        return mappedTeams;
    }

    function updateResultsComponent(team, scenario) {
        if (team) {
            const scenarioContainerElement = document.getElementById('result-scenario-container');
            if (scenario) {
                const scenarioNameElement = document.getElementById('result-scenario-name');
                scenarioNameElement.textContent = scenario.name;
                scenarioContainerElement.classList.remove('hidden');
            } else {
                scenarioContainerElement.classList.add('hidden');
            }

            const ranking = team.top_25_rank ? `#${team.top_25_rank} ` : '';
            const teamNameString = `${ranking}${team.team} ${team.nickname}`.toUpperCase();
            document.getElementById('result-team-name').textContent = teamNameString;

            const locationElement = document.getElementById('result-team-location');
            if (team.city && team.state) {
                locationElement.textContent = `${team.city}, ${team.state}`.toUpperCase();
                locationElement.classList.remove('hidden');
            } else {
                
                locationElement.textContent = '';
                locationElement.classList.add('hidden');
            }

            const stadiumElement = document.getElementById('result-team-stadium');
            if (team.stadium_name && team.stadium_capacity) {
                const formattedCapacityString = team.stadium_capacity.toLocaleString();
                stadiumElement.textContent = `${team.stadium_name} (Capacity: ${formattedCapacityString})`.toUpperCase();
                stadiumElement.classList.remove('hidden');
            } else {
                stadiumElement.textContent = '';
                stadiumElement.classList.add('hidden');
            }

            const logoElement = document.getElementById('result-team-logo');
            if (team.logo_url) {
                logoElement.src = team.logo_url;
                logoElement.classList.remove('hidden');
            } else {
                logoElement.classList.add('hidden');
            }

            let prestageStars = '';
            for (let i = 0; i < team.prestige; i++) {
                prestageStars += '★';
            }
            document.getElementById('result-team-prestige').innerHTML = prestageStars;

            const overallElement = document.getElementById('result-overall-ranking');
            if (team.overall) {
                overallElement.textContent = team.overall;
            } else {
                overallElement.textContent = 'TBD';
            }
            const offenseElement = document.getElementById('result-offense-ranking');
            if (team.offense) {
                offenseElement.textContent = team.offense;
            } else {
                offenseElement.textContent = 'TBD';
            }
            const defenseElement = document.getElementById('result-defense-ranking');
            if (team.defense) {
                defenseElement.textContent = team.defense;
            } else {
                defenseElement.textContent = 'TBD';
            }

            document.getElementById('result-first-d1-year').textContent = team.first_d1_year;
            document.getElementById('result-national-championships').textContent = team.national_championships;
            document.getElementById('result-last-championship-year').textContent = team.last_championship_year || 'N/A';
            document.getElementById('result-conference').textContent = team.conference;

            resultTeamContainer.classList.remove('hidden');
            resultErrorContainer.classList.add('hidden');
        } else {
            resultTeamContainer.classList.add('hidden');
            resultErrorContainer.classList.remove('hidden');
        }

        

    }

    function filterTeams(teams) {
        const selectedConferences = Array.from(conferenceCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        const selectedPrestiges = Array.from(prestigeCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => Number(checkbox.value));
        const selectedChampionships = Array.from(championshipCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        const firstD1YearValue = firstD1YearSelect.value;
        const rankSelections = Array.from(rankCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);

        return teams.filter(team => {
            const inConference = selectedConferences.length === 0 || selectedConferences.includes(team.conference);
            
            const inPrestige = selectedPrestiges.includes(team.prestige);
            const championshipCondition = (selectedChampionships.includes('one_or_more') && team.national_championships > 0) ||
                (selectedChampionships.includes('zero') && team.national_championships === 0);
            const rankCondition =  (rankSelections.includes('outside_top_25') && team.top_25_rank === 0) || (rankSelections.includes('top_25') && team.top_25_rank > 0);
            const firstD1YearCondition = (firstD1YearValue === 'any') ||
                (firstD1YearValue === '1800s' && team.first_d1_year < 1900) ||
                (firstD1YearValue === '1900-1949' && team.first_d1_year >= 1900 && team.first_d1_year <= 1949) ||
                (firstD1YearValue === '1950-1999' && team.first_d1_year >= 1950 && team.first_d1_year <= 1999) ||
                (firstD1YearValue === '2000-present' && team.first_d1_year >= 2000);
            return inConference && inPrestige && championshipCondition && rankCondition && firstD1YearCondition;
        });
    }

    function filterScenarioTeams(teams, scenario) {
        const filteredTeams = teams.filter(team => {
            const inConference = scenario.conference.length === 0 || scenario.conference.includes(team.conference);
            const prestigeCondition = handleCondition(scenario.conditions.prestige, team.prestige);
            const championshipCondition = handleCondition(scenario.conditions.national_championships, team.national_championships);
            const lastChampionshipYearCondition = handleCondition(scenario.conditions.last_championship_year, team.last_championship_year);
            const firstD1YearCondition = handleCondition(scenario.conditions.first_d1_year, team.first_d1_year);

            const rankedCondition = handleCondition(scenario.conditions.top_25_rank, team.top_25_rank);
            return inConference && prestigeCondition && championshipCondition && lastChampionshipYearCondition && firstD1YearCondition && rankedCondition;
        });
        return filteredTeams;
    }

    function handleCondition(condition, value) {
        
        if (condition === undefined) {
            return true;
        }
        if (value === undefined) {
            return false;
        }
        
        if (condition.gt !== undefined) {
            return value > condition.gt;
        }
        if (condition.lt !== undefined) {
            return value < condition.lt;
        }
        if (condition.eq !== undefined) {
            return value === condition.eq;
        }
        if (condition.gte !== undefined) {
            return value >= condition.gte;
        }
        if (condition.lte !== undefined) {
            return value <= condition.lte;
        }
        console.error('Invalid condition:', condition);
        return true;
    }

    function getRandomTeam(teams) {
        if (teams.length === 0) {
            return null;
        }
        const randomIndex = Math.floor(Math.random() * teams.length);
        return teams[randomIndex];
    }

    function displayResult(team, scenario) {
        updateResultsComponent(team, scenario);
        setUIState(UIState.LOADING);
    }
});