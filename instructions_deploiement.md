# Mise en place — Formulaire de candidature artistes

Deux fichiers travaillent ensemble :

- `formulaire_candidature_artistes.html` → la page que les artistes remplissent (bilingue FR/EN, autosave, envoi bloqué tant que c'est incomplet).
- `Code.gs` → le petit script Google qui reçoit chaque candidature et crée un dossier dédié dans ton Google Drive.

Il faut faire une seule mise en place, environ 5 minutes, puis tout est automatique.

## 1. Créer le script Google (Apps Script)

1. Va sur [script.google.com](https://script.google.com) avec le compte Google sur lequel tu veux recevoir les candidatures.
2. Clique sur **Nouveau projet**.
3. Supprime le code par défaut dans l'éditeur, puis colle tout le contenu du fichier `Code.gs` fourni.
4. Renomme le projet en haut (ex. « Candidatures Artistes ») et enregistre (icône disquette ou Ctrl/Cmd+S).

## 2. Déployer le script comme application web

1. En haut à droite, clique sur **Déployer** → **Nouveau déploiement**.
2. Clique sur l'icône en forme de roue dentée à côté de « Sélectionner le type » et choisis **Application Web**.
3. Renseigne :
   - **Exécuter en tant que** : Moi (ton compte)
   - **Qui a accès** : Tout le monde
4. Clique sur **Déployer**.
5. Google va te demander d'autoriser le script à accéder à ton Drive : accepte (clique sur ton compte, puis « Avancé » → « Accéder à [nom du projet] (non sécurisé) » si Google affiche cet avertissement — c'est normal pour un script que tu as toi-même écrit/collé).
6. Une URL de type `https://script.google.com/macros/s/XXXXXXX/exec` apparaît. **Copie cette URL.**

## 3. Relier le formulaire au script

1. Ouvre `formulaire_candidature_artistes.html` avec un éditeur de texte (Bloc-notes, TextEdit, VS Code...).
2. Cherche la ligne suivante (vers le début du `<script>`) :

   ```js
   var APPS_SCRIPT_URL = "COLLER_ICI_URL_DU_WEB_APP";
   ```

3. Remplace `COLLER_ICI_URL_DU_WEB_APP` par l'URL copiée à l'étape précédente, par exemple :

   ```js
   var APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXXXXX/exec";
   ```

4. Enregistre le fichier.

## 4. Mettre le formulaire en ligne

Le fichier HTML est autonome (aucune installation nécessaire), mais pour que les artistes puissent y accéder, il faut l'héberger quelque part. Options simples :

- L'envoyer par email en pièce jointe (l'artiste double-clique dessus pour l'ouvrir dans son navigateur) — fonctionne mais peu pratique pour partager un lien.
- L'héberger gratuitement en un clic sur un service comme **Netlify Drop** (glisser-déposer le fichier HTML sur [app.netlify.com/drop](https://app.netlify.com/drop)) — tu obtiens un lien public à partager.
- Si tu as un site web existant, y ajouter simplement ce fichier HTML.

Dis-moi si tu veux que je m'occupe de l'hébergement une fois que tu as connecté ton compte Google/Drive.

## 5. Résultat

Chaque candidature complète crée automatiquement, dans ton Drive, un dossier **« Candidatures Artistes »** contenant :

- Un sous-dossier par candidat (nommé avec la date, le nom et le prénom).
- À l'intérieur : le CV en PDF, et une fiche récapitulative texte avec toutes les informations saisies.
- Une feuille **« Suivi des candidatures »** à la racine du dossier, qui liste toutes les candidatures reçues (une ligne par candidat, avec un lien direct vers son dossier).

## Notes importantes

- **Autosave** : le formulaire enregistre automatiquement la saisie (et le CV) dans le navigateur de l'artiste. S'il ferme la page avant d'avoir son CV sous la main, il peut revenir plus tard sur la même page/navigateur et tout est resté rempli — il ne reste plus qu'à finir.
- **Envoi bloqué tant que c'est incomplet** : le bouton "Envoyer ma candidature" reste grisé tant que tous les champs obligatoires (sauf le n° intermittent, facultatif) ne sont pas remplis avec un CV PDF valide.
- **CV volumineux** : au-delà d'environ 5 Mo, l'enregistrement automatique du CV dans le navigateur peut échouer (limite technique du stockage local) ; le reste des champs continue d'être sauvegardé, mais l'artiste devra alors re-sélectionner son fichier CV avant l'envoi final.
- Pour changer le nom du dossier racine sur Drive, modifie `ROOT_FOLDER_NAME` en haut de `Code.gs`.
