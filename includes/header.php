<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle ?? 'LazzFit'; ?></title>
    <!-- Tailwind CSS via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Configuração personalizada do Tailwind -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#FF8C00',
                        'primary-dark': '#FF6000',
                        secondary: '#2563EB',
                        dark: '#333333',
                        gray: '#6B7280',
                        success: '#34C759',
                        danger: '#FF3B30',
                        warning: '#FF9500',
                        info: '#0A84FF',
                        light: '#F2F2F7'
                    },
                    fontFamily: {
                        sans: ['Poppins', 'sans-serif']
                    },
                    borderRadius: {
                        DEFAULT: '0.5rem',
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
