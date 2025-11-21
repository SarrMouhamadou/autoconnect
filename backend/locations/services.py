# backend/locations/services.py
# Service pour générer les contrats de location en PDF

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from django.core.files.base import ContentFile
from io import BytesIO
import os
from decimal import Decimal


class ContratLocationPDFGenerator:
    """
    Service pour générer des contrats de location en PDF.
    """
    
    def __init__(self, location):
        """
        Initialiser le générateur avec une location.
        
        Args:
            location: Instance du modèle Location
        """
        self.location = location
        self.buffer = BytesIO()
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Créer des styles personnalisés."""
        
        # Titre principal
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#008080'),  # Teal
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Sous-titre
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#008080'),
            spaceAfter=12,
            fontName='Helvetica-Bold'
        ))
        
        # Corps de texte
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['BodyText'],
            fontSize=10,
            spaceAfter=12,
            alignment=TA_LEFT
        ))
        
        # Texte centré
        self.styles.add(ParagraphStyle(
            name='CenteredBody',
            parent=self.styles['BodyText'],
            fontSize=10,
            alignment=TA_CENTER
        ))
        
        # Petits caractères
        self.styles.add(ParagraphStyle(
            name='SmallText',
            parent=self.styles['BodyText'],
            fontSize=8,
            textColor=colors.grey,
            alignment=TA_CENTER
        ))
    
    def _format_currency(self, amount):
        """Formater un montant en FCFA."""
        return f"{int(amount):,} FCFA".replace(',', ' ')
    
    def _format_date(self, date):
        """Formater une date en français."""
        months = [
            'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
        ]
        return f"{date.day} {months[date.month - 1]} {date.year}"
    
    def generate(self):
        """
        Générer le PDF du contrat.
        
        Returns:
            BytesIO: Buffer contenant le PDF généré
        """
        # Créer le document
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Construire le contenu
        story = []
        
        # En-tête
        story.extend(self._build_header())
        story.append(Spacer(1, 0.5*cm))
        
        # Informations du contrat
        story.extend(self._build_contract_info())
        story.append(Spacer(1, 0.5*cm))
        
        # Parties
        story.extend(self._build_parties())
        story.append(Spacer(1, 0.5*cm))
        
        # Véhicule
        story.extend(self._build_vehicule())
        story.append(Spacer(1, 0.5*cm))
        
        # Conditions
        story.extend(self._build_conditions())
        story.append(Spacer(1, 0.5*cm))
        
        # Tarification
        story.extend(self._build_tarification())
        story.append(Spacer(1, 0.5*cm))
        
        # Signatures
        story.extend(self._build_signatures())
        
        # Pied de page
        story.append(Spacer(1, 1*cm))
        story.extend(self._build_footer())
        
        # Construire le PDF
        doc.build(story)
        
        # Retourner au début du buffer
        self.buffer.seek(0)
        return self.buffer
    
    def _build_header(self):
        """Construire l'en-tête du contrat."""
        elements = []
        
        # Titre
        title = Paragraph(
            "CONTRAT DE LOCATION DE VÉHICULE",
            self.styles['CustomTitle']
        )
        elements.append(title)
        
        # Numéro de contrat
        if hasattr(self.location, 'contrat'):
            numero = Paragraph(
                f"N° {self.location.contrat.numero_contrat}",
                self.styles['CenteredBody']
            )
            elements.append(numero)
        
        return elements
    
    def _build_contract_info(self):
        """Construire les informations du contrat."""
        elements = []
        
        elements.append(Paragraph("INFORMATIONS DU CONTRAT", self.styles['CustomHeading']))
        
        data = [
            ['Date de création:', self._format_date(self.location.date_creation.date())],
            ['Période de location:', f"Du {self._format_date(self.location.date_debut)} au {self._format_date(self.location.date_fin)}"],
            ['Durée:', f"{self.location.nombre_jours} jour(s)"],
        ]
        
        table = Table(data, colWidths=[5*cm, 12*cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#008080')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(table)
        return elements
    
    def _build_parties(self):
        """Construire les informations des parties."""
        elements = []
        
        # LOCATAIRE (Client)
        elements.append(Paragraph("LE LOCATAIRE", self.styles['CustomHeading']))
        
        client_data = [
            ['Nom complet:', self.location.client.nom_complet],
            ['Email:', self.location.client.email],
            ['Téléphone:', self.location.client.telephone or 'Non renseigné'],
        ]
        
        client_table = Table(client_data, colWidths=[5*cm, 12*cm])
        client_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#008080')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(client_table)
        elements.append(Spacer(1, 0.3*cm))
        
        # LOUEUR (Concessionnaire)
        elements.append(Paragraph("LE LOUEUR", self.styles['CustomHeading']))
        
        loueur_data = [
            ['Concession:', self.location.concession.nom],
            ['Adresse:', f"{self.location.concession.adresse}, {self.location.concession.ville}"],
            ['Téléphone:', self.location.concession.telephone],
            ['Email:', self.location.concession.email],
        ]
        
        loueur_table = Table(loueur_data, colWidths=[5*cm, 12*cm])
        loueur_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#008080')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(loueur_table)
        return elements
    
    def _build_vehicule(self):
        """Construire les informations du véhicule."""
        elements = []
        
        elements.append(Paragraph("VÉHICULE LOUÉ", self.styles['CustomHeading']))
        
        vehicule = self.location.vehicule
        
        vehicule_data = [
            ['Marque et modèle:', vehicule.nom_complet],
            ['Immatriculation:', vehicule.immatriculation],
            ['Année:', str(vehicule.annee)],
            ['Couleur:', vehicule.couleur],
            ['Kilométrage départ:', f"{self.location.kilometrage_depart or 'À définir'} km"],
        ]
        
        vehicule_table = Table(vehicule_data, colWidths=[5*cm, 12*cm])
        vehicule_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#008080')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        elements.append(vehicule_table)
        return elements
    
    def _build_conditions(self):
        """Construire les conditions de location."""
        elements = []
        
        elements.append(Paragraph("CONDITIONS DE LOCATION", self.styles['CustomHeading']))
        
        conditions = [
            "1. Le locataire s'engage à utiliser le véhicule conformément aux règles de circulation en vigueur.",
            "2. Le locataire est responsable du véhicule pendant toute la durée de la location.",
            "3. Le véhicule doit être rendu dans l'état où il a été loué, propre et avec le même niveau de carburant.",
            f"4. En cas de retard, une pénalité de {self.location.taux_penalite_jour}% du tarif journalier sera appliquée par jour de retard.",
            "5. Le locataire s'engage à prévenir immédiatement le loueur en cas d'accident ou de panne.",
            f"6. Une caution de {self._format_currency(self.location.caution)} est versée au moment de la prise en charge du véhicule.",
            "7. La caution sera restituée au retour du véhicule, déduction faite des éventuels dommages.",
        ]
        
        for condition in conditions:
            p = Paragraph(condition, self.styles['CustomBody'])
            elements.append(p)
        
        return elements
    
    def _build_tarification(self):
        """Construire le tableau de tarification."""
        elements = []
        
        elements.append(Paragraph("TARIFICATION", self.styles['CustomHeading']))
        
        data = [
            ['Description', 'Montant'],
            ['Prix par jour', self._format_currency(self.location.prix_jour)],
            ['Nombre de jours', str(self.location.nombre_jours)],
            ['Prix total de la location', self._format_currency(self.location.prix_total)],
            ['Caution (remboursable)', self._format_currency(self.location.caution)],
        ]
        
        # Ajouter les pénalités si applicable
        if self.location.montant_penalite > 0:
            data.append(['Pénalités de retard', self._format_currency(self.location.montant_penalite)])
            data.append(['TOTAL FINAL', self._format_currency(self.location.montant_total_final)])
        
        table = Table(data, colWidths=[12*cm, 5*cm])
        table.setStyle(TableStyle([
            # En-tête
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#008080')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Corps
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
            
            # Grille
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        
        # Ligne totale en gras si pénalités
        if self.location.montant_penalite > 0:
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, -1), (-1, -1), 11),
            ]))
        
        elements.append(table)
        return elements
    
    def _build_signatures(self):
        """Construire la section des signatures."""
        elements = []
        
        elements.append(Spacer(1, 1*cm))
        elements.append(Paragraph("SIGNATURES", self.styles['CustomHeading']))
        
        data = [
            ['Le Locataire', 'Le Loueur'],
            ['', ''],
            ['', ''],
            ['', ''],
            [f"{self.location.client.nom_complet}", f"{self.location.concessionnaire.nom_complet}"],
        ]
        
        table = Table(data, colWidths=[8.5*cm, 8.5*cm], rowHeights=[0.5*cm, 2*cm, 0.3*cm, 0.3*cm, 0.5*cm])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LINEABOVE', (0, 3), (-1, 3), 1, colors.black),
        ]))
        
        elements.append(table)
        return elements
    
    def _build_footer(self):
        """Construire le pied de page."""
        elements = []
        
        footer_text = "Ce contrat est généré électroniquement et peut être vérifié via son numéro unique."
        footer = Paragraph(footer_text, self.styles['SmallText'])
        elements.append(footer)
        
        return elements
    
    def save_to_model(self):
        """
        Générer le PDF et le sauvegarder dans le modèle ContratLocation.
        
        Returns:
            ContratLocation: Instance du contrat créé
        """
        from .models import ContratLocation
        
        # Générer le PDF
        pdf_buffer = self.generate()
        
        # Créer ou récupérer le contrat
        contrat, created = ContratLocation.objects.get_or_create(
            location=self.location
        )
        
        # Nom du fichier
        filename = f"contrat_location_{self.location.id}.pdf"
        
        # Sauvegarder le fichier
        contrat.fichier_pdf.save(
            filename,
            ContentFile(pdf_buffer.getvalue()),
            save=False
        )
        
        # Générer le hash
        contrat.save()
        contrat.generer_hash()
        
        return contrat


def generer_contrat_location(location):
    """
    Fonction utilitaire pour générer un contrat de location.
    
    Args:
        location: Instance du modèle Location
    
    Returns:
        ContratLocation: Instance du contrat créé
    """
    generator = ContratLocationPDFGenerator(location)
    return generator.save_to_model()