# CNJ Processor - Serverless AWS

Serviço serverless para processamento assíncrono de números CNJ (Cadastro Nacional de Justiça).

## Arquitetura

Esta solução utiliza uma arquitetura serverless na AWS com os seguintes componentes:

- **API Gateway**: Recebe requisições HTTP com o número CNJ
- **Lambda (Receiver)**: Valida o CNJ e envia para processamento assíncrono
- **SQS**: Gerencia fila de mensagens para processamento assíncrono
- **Lambda (Processor)**: Processa CNJs da fila, chama API externa e armazena resultados
- **DynamoDB**: Armazena os números CNJ e as respostas da API externa
- **CloudWatch**: Monitoramento e observabilidade

## Cenários de Volumetria

A arquitetura foi projetada para atender dois cenários:

1. **Baixa volumetria**: 1 chamada por hora

   - Configuração padrão é suficiente
   - Custo extremamente baixo

2. **Alta volumetria**: 100 chamadas por minuto
   - Auto-scaling do Lambda Processor
   - Configuração de batch size para processamento eficiente
   - Monitoramento via CloudWatch

## Observabilidade

- **Logs estruturados**: Formato JSON para facilitar consultas
- **Métricas**: CloudWatch Metrics para monitoramento de performance
- **Tracing**: X-Ray para rastreamento de requisições
- **Dashboard**: CloudWatch Dashboard para visualização centralizada

## Segurança

- **Autenticação**: API Key no API Gateway
- **Autorização**: IAM Roles com permissões mínimas necessárias
- **Criptografia**: Em trânsito e em repouso
- **Validação**: Validação de entrada para prevenir injeções

## Considerações de Custo

A arquitetura serverless é extremamente econômica:

1. **API Gateway**: Custo por requisição (~$3.50 por milhão)
2. **Lambda**: Custo por execução e tempo (~$0.20 por milhão + tempo)
3. **SQS**: Custo por milhão de requisições (~$0.40 por milhão)
4. **DynamoDB**: On-Demand com cobrança por operação

Para o cenário 1 (1 chamada/hora = ~720/mês), o custo é praticamente zero.
Para o cenário 2 (100 chamadas/minuto = ~4.3 milhões/mês), o custo ainda é baixo, estimado em menos de $20/mês.

## Instalação e Deploy

### Pré-requisitos

- Node.js 14+
- AWS CLI configurado
- Serverless Framework

### Deploy

```bash
# Instalar dependências
npm install

# Build TypeScript
npm run build

# Deploy para ambiente de desenvolvimento
npm run deploy -- --stage dev

# Deploy para produção
npm run deploy -- --stage prod
```
