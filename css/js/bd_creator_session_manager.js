/**
 * BD Creator - Gestionnaire de sessions (Version finale)
 * Ce script permet de sauvegarder et charger des sessions de création de BD
 * Adapté pour fonctionner avec la structure de dossiers spécifique du projet
 */

// Classe principale pour gérer les sessions
class SessionManager {
    constructor() {
        this.currentSessionId = null;
        this.sessions = this.loadAllSessions();
        this.initUI();
        
        // Vérifier si nous sommes sur une nouvelle session
        const isNewSession = sessionStorage.getItem('bdNewSession');
        if (isNewSession === 'true') {
            console.log("Nouvelle session détectée");
            // Réinitialiser le marqueur
            sessionStorage.removeItem('bdNewSession');
            // Mettre à jour l'interface
            this.updateCurrentSessionInfo('Nouvelle session');
        }
    }

    // Initialiser l'interface utilisateur pour la gestion des sessions
    initUI() {
        // Créer le conteneur pour les contrôles de session s'il n'existe pas déjà
        if (!document.getElementById('session-controls')) {
            const container = document.querySelector('.container');
            const navigationDiv = document.querySelector('.navigation');
            
            if (container && navigationDiv) {
                const sessionControls = document.createElement('div');
                sessionControls.id = 'session-controls';
                sessionControls.className = 'session-controls';
                sessionControls.innerHTML = `
                    <div class="session-buttons">
                        <button id="save-session-btn" class="button session-button">Sauvegarder la session</button>
                        <button id="new-session-btn" class="button session-button">Nouvelle session</button>
                        <select id="load-session-select" class="session-select">
                            <option value="">Charger une session...</option>
                        </select>
                    </div>
                    <div id="session-info" class="session-info">
                        Session actuelle: <span id="current-session-name">Nouvelle session</span>
                    </div>
                `;
                
                container.insertBefore(sessionControls, navigationDiv.nextSibling);
                
                // Ajouter les styles CSS pour les contrôles de session
                if (!document.getElementById('session-manager-styles')) {
                    const styleElement = document.createElement('style');
                    styleElement.id = 'session-manager-styles';
                    styleElement.textContent = `
                        .session-controls {
                            background-color: #f0f0f0;
                            padding: 10px;
                            border-radius: 5px;
                            margin-bottom: 20px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            flex-wrap: wrap;
                        }
                        .session-buttons {
                            display: flex;
                            gap: 10px;
                            flex-wrap: wrap;
                        }
                        .session-button {
                            background-color: #2980b9;
                        }
                        .session-select {
                            padding: 10px;
                            border-radius: 5px;
                            border: 1px solid #ddd;
                            background-color: white;
                            min-width: 200px;
                        }
                        .session-info {
                            margin-top: 10px;
                            font-style: italic;
                            color: #555;
                        }
                        #new-session-btn {
                            background-color: #27ae60;
                        }
                        #delete-session-btn {
                            background-color: #e74c3c;
                        }
                    `;
                    document.head.appendChild(styleElement);
                }
                
                // Ajouter les écouteurs d'événements
                this.addEventListeners();
            }
        }
        
        // Mettre à jour la liste des sessions disponibles
        this.updateSessionsList();
    }
    
    // Ajouter les écouteurs d'événements pour les boutons
    addEventListeners() {
        const saveButton = document.getElementById('save-session-btn');
        const newButton = document.getElementById('new-session-btn');
        const loadSelect = document.getElementById('load-session-select');
        
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveCurrentSession());
        }
        
        if (newButton) {
            newButton.addEventListener('click', () => this.startNewSession());
        }
        
        if (loadSelect) {
            loadSelect.addEventListener('change', (e) => {
                const sessionId = e.target.value;
                if (sessionId) {
                    this.loadSession(sessionId);
                    // Réinitialiser le sélecteur
                    e.target.value = '';
                }
            });
        }
    }
    
    // Mettre à jour la liste des sessions dans le sélecteur
    updateSessionsList() {
        const loadSelect = document.getElementById('load-session-select');
        if (loadSelect) {
            // Conserver uniquement l'option par défaut
            loadSelect.innerHTML = '<option value="">Charger une session...</option>';
            
            // Ajouter les sessions sauvegardées
            Object.keys(this.sessions).forEach(sessionId => {
                const session = this.sessions[sessionId];
                const option = document.createElement('option');
                option.value = sessionId;
                option.textContent = `${session.name} (${new Date(session.timestamp).toLocaleString()})`;
                loadSelect.appendChild(option);
            });
        }
    }
    
    // Sauvegarder la session actuelle
    saveCurrentSession() {
        // Demander un nom pour la session si c'est une nouvelle sauvegarde
        let sessionName = '';
        if (this.currentSessionId && this.sessions[this.currentSessionId]) {
            sessionName = this.sessions[this.currentSessionId].name;
        }
        
        if (!sessionName) {
            sessionName = prompt('Donnez un nom à cette session:', 'Ma BD ' + new Date().toLocaleDateString());
            if (!sessionName) return; // L'utilisateur a annulé
        }
        
        // Collecter les données de la session actuelle
        const sessionData = this.collectSessionData();
        sessionData.name = sessionName;
        sessionData.timestamp = Date.now();
        
        // Générer un ID unique si c'est une nouvelle session
        if (!this.currentSessionId) {
            this.currentSessionId = 'session_' + Date.now();
        }
        
        // Sauvegarder la session
        this.sessions[this.currentSessionId] = sessionData;
        this.saveAllSessions();
        
        // Mettre à jour l'interface
        this.updateSessionsList();
        this.updateCurrentSessionInfo(sessionName);
        
        alert('Session sauvegardée avec succès !');
    }
    
    // Démarrer une nouvelle session (FONCTION CORRIGÉE)
    startNewSession() {
        if (confirm('Voulez-vous vraiment commencer une nouvelle session ? Les modifications non sauvegardées seront perdues.')) {
            try {
                console.log("Démarrage d'une nouvelle session...");
                
                // Réinitialiser l'ID de session actuelle
                this.currentSessionId = null;
                
                // Effacer les données de session du localStorage
                localStorage.removeItem('bdKeywords');
                localStorage.removeItem('bdScenario');
                localStorage.removeItem('bdChapter');
                localStorage.removeItem('bdStoryboard');
                
                // Utiliser sessionStorage pour indiquer qu'il s'agit d'une nouvelle session
                // (cela persistera pendant la redirection)
                sessionStorage.setItem('bdNewSession', 'true');
                
                // Mettre à jour l'interface avant la redirection
                this.updateCurrentSessionInfo('Nouvelle session');
                
                // Déterminer le chemin vers index.html en fonction de l'emplacement actuel
                let indexPath = this.getPathToIndex();
                
                console.log("Redirection vers: " + indexPath);
                
                // Rediriger vers la page d'accueil avec un paramètre pour éviter la mise en cache
                window.location.href = indexPath + '?new=' + Date.now();
            } catch (error) {
                console.error('Erreur lors de la création d\'une nouvelle session:', error);
                alert('Une erreur est survenue lors de la création d\'une nouvelle session. Veuillez réessayer.');
            }
        }
    }
    
    // Déterminer le chemin vers index.html en fonction de l'emplacement actuel
    getPathToIndex() {
        // Obtenir le chemin actuel
        const currentPath = window.location.pathname;
        console.log("Chemin actuel: " + currentPath);
        
        // Vérifier si nous sommes dans un sous-dossier
        if (currentPath.includes('/js/') || currentPath.includes('/css/')) {
            return '../index.html';
        } else {
            return 'index.html';
        }
    }
    
    // Charger une session sauvegardée
    loadSession(sessionId) {
        if (!this.sessions[sessionId]) {
            alert('Session introuvable !');
            return;
        }
        
        const session = this.sessions[sessionId];
        
        // Confirmer le chargement
        if (confirm(`Voulez-vous charger la session "${session.name}" ? Les modifications non sauvegardées seront perdues.`)) {
            try {
                // Définir la session actuelle
                this.currentSessionId = sessionId;
                
                // Restaurer les données de la session
                this.restoreSessionData(session);
                
                // Mettre à jour l'interface
                this.updateCurrentSessionInfo(session.name);
                
                // Déterminer le chemin de base en fonction de l'emplacement actuel
                let basePath = '';
                if (window.location.pathname.includes('/js/') || window.location.pathname.includes('/css/')) {
                    basePath = '../';
                }
                
                // Rediriger vers la page appropriée en fonction des données disponibles
                let targetPage = basePath + 'index.html';
                if (session.currentPage) {
                    targetPage = basePath + session.currentPage;
                    // Ajouter les paramètres d'URL si présents
                    if (session.urlParams) {
                        targetPage += session.urlParams;
                    }
                }
                
                // Ajouter un paramètre timestamp pour éviter la mise en cache
                if (targetPage.includes('?')) {
                    targetPage += '&ts=' + Date.now();
                } else {
                    targetPage += '?ts=' + Date.now();
                }
                
                console.log("Redirection vers: " + targetPage);
                window.location.href = targetPage;
            } catch (error) {
                console.error('Erreur lors du chargement de la session:', error);
                alert('Une erreur est survenue lors du chargement de la session. Veuillez réessayer.');
            }
        }
    }
    
    // Collecter les données de la session actuelle
    collectSessionData() {
        const data = {
            currentPage: window.location.pathname.split('/').pop(),
            keywords: localStorage.getItem('bdKeywords') || '',
            scenario: localStorage.getItem('bdScenario') || '',
            chapter: localStorage.getItem('bdChapter') || '',
            storyboard: localStorage.getItem('bdStoryboard') || '',
            urlParams: window.location.search
        };
        
        return data;
    }
    
    // Restaurer les données d'une session
    restoreSessionData(session) {
        // Restaurer les données dans le localStorage
        if (session.keywords) localStorage.setItem('bdKeywords', session.keywords);
        if (session.scenario) localStorage.setItem('bdScenario', session.scenario);
        if (session.chapter) localStorage.setItem('bdChapter', session.chapter);
        if (session.storyboard) localStorage.setItem('bdStoryboard', session.storyboard);
    }
    
    // Mettre à jour l'information sur la session actuelle
    updateCurrentSessionInfo(sessionName) {
        const sessionNameElement = document.getElementById('current-session-name');
        if (sessionNameElement) {
            sessionNameElement.textContent = sessionName;
        }
    }
    
    // Charger toutes les sessions depuis le localStorage
    loadAllSessions() {
        const sessionsJson = localStorage.getItem('bdCreatorSessions');
        return sessionsJson ? JSON.parse(sessionsJson) : {};
    }
    
    // Sauvegarder toutes les sessions dans le localStorage
    saveAllSessions() {
        localStorage.setItem('bdCreatorSessions', JSON.stringify(this.sessions));
    }
}

// Initialiser le gestionnaire de sessions lorsque la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    // Petit délai pour s'assurer que le DOM est complètement chargé
    setTimeout(function() {
        console.log("Initialisation du gestionnaire de sessions...");
        window.bdSessionManager = new SessionManager();
    }, 100);
});


