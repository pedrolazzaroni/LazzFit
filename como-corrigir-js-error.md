# Como Corrigir o Erro "You need to enable JavaScript to run this app"

Se você estiver vendo esse erro, há algumas possibilidades:

## Verifique se o JavaScript está habilitado no navegador

1. **Chrome**:
   - Vá para ⋮ (menu) > Configurações > Privacidade e segurança
   - Clique em "Configurações de site" > JavaScript
   - Certifique-se de que "Sites podem usar JavaScript" esteja ativado

2. **Firefox**:
   - Vá para ≡ (menu) > Configurações > Privacidade e Segurança
   - Role até "Permissões" e certifique-se de que "JavaScript" esteja habilitado

3. **Edge**:
   - Vá para ⋯ (menu) > Configurações > Cookies e permissões do site
   - Clique em "JavaScript" e certifique-se de que esteja ativado

## Use a versão pré-compilada

Em vez de executar o servidor de desenvolvimento, use os scripts para construir e servir uma versão otimizada:

1. Construa a versão web:
   ```
   build-web.bat
   ```

2. Sirva a versão construída:
   ```
   serve-web.bat
   ```

3. Acesse: http://localhost:3000

## Verifique extensões do navegador

Algumas extensões podem bloquear JavaScript. Tente:

1. Usar uma janela anônima/incógnita
2. Desativar extensões temporariamente

## Limpe o cache

Limpe o cache do navegador:

1. Chrome/Edge: Ctrl+Shift+Del
2. Firefox: Ctrl+Shift+Del
3. Selecione "Limpar dados de navegação" ou equivalente

## Teste em outro navegador

Se o problema persistir, tente usar outro navegador como:
- Google Chrome
- Microsoft Edge
- Firefox

## Solução de problemas avançada

Se nada funcionar, tente:

1. Abrir as Ferramentas de Desenvolvedor (F12)
2. Ir para a aba "Console"
3. Verificar se há erros específicos
4. Envie um screenshot dos erros para obter ajuda adicional
