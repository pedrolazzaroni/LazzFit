import customtkinter as ctk

# Cores principais do LazzFit
LAZZFIT_COLORS = {
    "orange_primary": "#FF6600",
    "orange_light": "#FF8533",
    "orange_dark": "#CC5200",
    "black_primary": "#121212",
    "black_light": "#282828",
    "black_dark": "#000000",
    "white": "#FFFFFF",
    "gray_light": "#E0E0E0",
    "gray_medium": "#9E9E9E",
    "gray_dark": "#424242"
}

# Configuração de fontes
FONTS = {
    "heading": ("Roboto", 24, "bold"),
    "subheading": ("Roboto", 18, "bold"),
    "body": ("Roboto", 12),
    "body_bold": ("Roboto", 12, "bold"),
    "small": ("Roboto", 10),
    "tiny": ("Roboto", 8),
}

def set_appearance_mode(mode):
    """Configura o modo de aparência (claro/escuro)"""
    if mode.lower() == "light":
        ctk.set_appearance_mode("light")
    else:
        ctk.set_appearance_mode("dark")
    
    # Aplicar cores temáticas personalizadas
    customize_theme_colors(mode.lower())

def customize_theme_colors(mode):
    """Personaliza as cores do tema CustomTkinter"""
    # Cores personalizadas para o tema LazzFit
    color_theme = {
        "CTkButton": {
            "corner_radius": 6,
            "border_width": 0,
            "fg_color": [LAZZFIT_COLORS["orange_primary"], LAZZFIT_COLORS["orange_primary"]],
            "hover_color": [LAZZFIT_COLORS["orange_light"], LAZZFIT_COLORS["orange_dark"]],
            "border_color": [LAZZFIT_COLORS["orange_dark"], LAZZFIT_COLORS["orange_light"]],
            "text_color": [LAZZFIT_COLORS["white"], LAZZFIT_COLORS["white"]],
            "text_color_disabled": [LAZZFIT_COLORS["gray_medium"], LAZZFIT_COLORS["gray_dark"]],
        },
        "CTkFrame": {
            "corner_radius": 6,
            "border_width": 0,
            "fg_color": ["#EEEEEE", "#2B2B2B"] if mode == "light" else ["#2B2B2B", "#1E1E1E"],
            "top_fg_color": ["#FFFFFF", "#333333"] if mode == "light" else ["#333333", "#222222"],
            "border_color": ["#E0E0E0", "#404040"] if mode == "light" else ["#404040", "#505050"],
        },
        "CTkEntry": {
            "corner_radius": 6,
            "border_width": 1,
            "fg_color": ["#F9F9F9", "#343434"] if mode == "light" else ["#343434", "#2A2A2A"],
            "border_color": [LAZZFIT_COLORS["gray_medium"], LAZZFIT_COLORS["gray_dark"]],
            "text_color": ["#000000", "#FFFFFF"] if mode == "light" else ["#FFFFFF", "#DDDDDD"],
        },
        "CTkLabel": {
            "corner_radius": 0,
            "fg_color": "transparent",
            "text_color": ["#000000", "#FFFFFF"] if mode == "light" else ["#FFFFFF", "#EEEEEE"],
        },
        "CTkProgressBar": {
            "corner_radius": 6,
            "border_width": 0,
            "fg_color": ["#EEEEEE", "#444444"] if mode == "light" else ["#444444", "#333333"],
            "progress_color": [LAZZFIT_COLORS["orange_primary"], LAZZFIT_COLORS["orange_primary"]],
            "border_color": [LAZZFIT_COLORS["gray_medium"], LAZZFIT_COLORS["gray_dark"]],
        },
        "CTkSlider": {
            "corner_radius": 6,
            "button_corner_radius": 6,
            "border_width": 0,
            "button_length": 0,
            "fg_color": ["#EEEEEE", "#4A4A4A"] if mode == "light" else ["#4A4A4A", "#333333"],
            "progress_color": [LAZZFIT_COLORS["orange_light"], LAZZFIT_COLORS["orange_dark"]],
            "button_color": [LAZZFIT_COLORS["orange_primary"], LAZZFIT_COLORS["orange_primary"]],
            "button_hover_color": [LAZZFIT_COLORS["orange_light"], LAZZFIT_COLORS["orange_dark"]],
        },
        "CTkSwitch": {
            "corner_radius": 6,
            "border_width": 0,
            "button_length": 0,
            "fg_color": ["#EEEEEE", "#4D4D4D"] if mode == "light" else ["#4D4D4D", "#333333"],
            "progress_color": [LAZZFIT_COLORS["orange_primary"], LAZZFIT_COLORS["orange_primary"]],
            "button_color": ["#FFFFFF", "#DDDDDD"] if mode == "light" else ["#DDDDDD", "#BBBBBB"],
            "button_hover_color": [LAZZFIT_COLORS["orange_light"], LAZZFIT_COLORS["orange_dark"]],
            "text_color": ["#000000", "#FFFFFF"] if mode == "light" else ["#FFFFFF", "#DDDDDD"],
        },
        "CTkComboBox": {
            "corner_radius": 6,
            "border_width": 1,
            "fg_color": ["#F9F9F9", "#343434"] if mode == "light" else ["#343434", "#2A2A2A"],
            "border_color": [LAZZFIT_COLORS["gray_medium"], LAZZFIT_COLORS["gray_dark"]],
            "button_color": [LAZZFIT_COLORS["orange_primary"], LAZZFIT_COLORS["orange_primary"]],
            "button_hover_color": [LAZZFIT_COLORS["orange_light"], LAZZFIT_COLORS["orange_dark"]],
            "text_color": ["#000000", "#FFFFFF"] if mode == "light" else ["#FFFFFF", "#DDDDDD"],
            "dropdown_fg_color": ["#F5F5F5", "#383838"] if mode == "light" else ["#383838", "#2A2A2A"],
            "dropdown_hover_color": ["#EAEAEA", "#444444"] if mode == "light" else ["#444444", "#333333"],
            "dropdown_text_color": ["#000000", "#FFFFFF"] if mode == "light" else ["#FFFFFF", "#DDDDDD"],
        },
    }
    
    # Aplicar o tema personalizado
    for widget, properties in color_theme.items():
        for prop, value in properties.items():
            ctk.set_default_color_theme("dark-blue")  # Base theme
            # Aplicaria aqui modificações específicas ao CTk se a API permitisse
            # Isso é uma simplificação para o exemplo
