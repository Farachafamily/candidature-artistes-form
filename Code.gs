/**
 * Backend Google Apps Script pour le formulaire "Candidature Artiste International".
 *
 * Ce script reçoit les données envoyées par le formulaire HTML (formulaire_candidature_artistes.html),
 * crée un dossier Google Drive par candidature (CV inclus) et ajoute une ligne de suivi
 * dans une feuille de calcul "Suivi des candidatures".
 *
 * Voir instructions_deploiement.md pour la mise en place complète.
 */

var ROOT_FOLDER_NAME = "Candidatures Artistes";
var TRACKING_SHEET_NAME = "Suivi des candidatures";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var rootFolder = getOrCreateFolder(DriveApp.getRootFolder(), ROOT_FOLDER_NAME);

    var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT", "yyyyMMdd_HHmmss");
    var candidateFolderName = stamp + "_" + sanitize(data.nom) + "_" + sanitize(data.prenom);
    var candidateFolder = rootFolder.createFolder(candidateFolderName);

    // 1) CV PDF
    if (data.cvBase64) {
      var bytes = Utilities.base64Decode(data.cvBase64);
      var blob = Utilities.newBlob(bytes, data.cvMimeType || "application/pdf", data.cvFileName || "CV.pdf");
      candidateFolder.createFile(blob);
    }

    // 2) Fiche récapitulative lisible
    var summary = buildSummary(data);
    candidateFolder.createFile("Fiche_candidature.txt", summary, MimeType.PLAIN_TEXT);

    // 3) Ligne de suivi dans le Sheet centralisé
    var sheet = getOrCreateTrackingSheet(rootFolder);
    sheet.appendRow([
      new Date(),
      data.prenom || "",
      data.nom || "",
      data.instruments || "",
      data.email || "",
      asText(data.telephone),
      asText(data.contactUrgence),
      data.youtube || "",
      asText(data.intermittent),
      data.duree || "",
      data.langue || "",
      candidateFolder.getUrl()
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", folderUrl: candidateFolder.getUrl() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Petit endpoint de test : ouvrir l'URL du Web App dans un navigateur doit afficher ce message.
function doGet(e) {
  return ContentService.createTextOutput("Le script de candidature fonctionne. Utilisez le formulaire HTML pour envoyer une candidature.");
}

function getOrCreateFolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}

// Force une valeur à être interprétée comme du texte brut par Google Sheets
// (évite les #ERROR! quand la valeur commence par "+", "=", "-", etc.)
function asText(s) {
  var v = (s || "").toString();
  return v === "" ? "" : "'" + v;
}

function sanitize(s) {
  var clean = (s || "").toString().trim().replace(/[^a-zA-Z0-9À-ÿ]+/g, "_").substring(0, 30);
  return clean || "NA";
}

function buildSummary(data) {
  return [
    "FICHE DE CANDIDATURE",
    "=====================",
    "Date d'envoi : " + (data.dateEnvoi || ""),
    "",
    "Prénom(s) : " + (data.prenom || ""),
    "Nom : " + (data.nom || ""),
    "Instrument(s) : " + (data.instruments || ""),
    "Email : " + (data.email || ""),
    "Téléphone : " + (data.telephone || ""),
    "Contact téléphonique d'urgence : " + (data.contactUrgence || ""),
    "Lien YouTube (vidéo sur scène) : " + (data.youtube || ""),
    "N° intermittent du spectacle : " + (data.intermittent || "(non renseigné)"),
    "Durée minimum de disponibilité : " + (data.duree || ""),
    "Langue du formulaire utilisée : " + (data.langue || "")
  ].join("\n");
}

function getOrCreateTrackingSheet(rootFolder) {
  var files = rootFolder.getFilesByName(TRACKING_SHEET_NAME);
  var ss;
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(TRACKING_SHEET_NAME);
    var file = DriveApp.getFileById(ss.getId());
    rootFolder.addFile(file);
    // Retire le fichier de la racine du Drive pour ne le laisser que dans le dossier "Candidatures Artistes"
    DriveApp.getRootFolder().removeFile(file);
    var sheet = ss.getSheets()[0];
    sheet.appendRow([
      "Date", "Prénom", "Nom", "Instruments", "Email", "Téléphone",
      "Contact urgence", "YouTube", "N° intermittent", "Durée dispo", "Langue", "Dossier Drive"
    ]);
    sheet.setFrozenRows(1);
  }
  return ss.getSheets()[0];
}
