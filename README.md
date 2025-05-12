![image](https://github.com/user-attachments/assets/1a875b81-6b55-415c-8c72-02c79a89d547)# CNJ Processor - Serverless AWS

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

### Padrões de Resiliência

## Circuit Breaker

Implementado para proteger contra falhas na API externa:

    Abre o circuito após 3 falhas consecutivas
    Fornece dados de fallback quando aberto
    Tenta restabelecer conexão após 60 segundos

## Retry com Backoff Exponencial

    Tentativas automáticas para chamadas à API externa
    Intervalo entre tentativas aumenta exponencialmente
    Máximo de 3 tentativas antes de falhar

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

### Diagrama da arquitetura

![image](https://github.com/user-attachments/assets/c249ce36-5189-4ca4-95a5-b632571ed065)

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

### Testando Localmente

Para testar a aplicação em ambiente de desenvolvimento local:

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Iniciar servidor local
npx serverless offline

```

O servidor estará disponível em: http://localhost:3000/dev/cnj

### Testando a API

Usando curl

```bash
curl -X POST \
  http://localhost:3000/dev/cnj \
  -H "Content-Type: application/json" \
  -d '{"cnj":"1234567-12.1234.1.12.1234"}'
```

Usando Bruno/Postman/Insomnia

Configure uma requisição POST para http://localhost:3000/dev/cnj
Adicione o header Content-Type: application/json
No corpo da requisição, use:

```json
{
  "cnj": "1234567-12.1234.1.12.1234"
}
```

## Resposta Esperada

```json
{
  "success": true,
  "requestId": "2afe8d4c-d075-47f4-88d0-e068e541a8b6",
  "message": "CNJ received for processing"
}
```

### Comportamento em Ambiente Local

Em ambiente de desenvolvimento local:

    SQS é simulado: As mensagens não são realmente enviadas para AWS SQS
    DynamoDB não é acessado: O processamento completo não ocorre
    API Externa não é chamada: Não há comunicação com serviços externos

Isso permite testar o fluxo básico da API sem necessidade de credenciais AWS ou serviços externos configurados.

Para visualizar o comportamento, observe os logs no console onde o serverless-offline está sendo executado. Você verá mensagens indicando o mock do SQS:

{"level":"info","message":"Mock: Message sent to SQS","service":"receiver",...}

Para testar o fluxo completo com processamento real, é necessário fazer o deploy na AWS.

### Uso da API

Endpoint

POST /cnj

Headers

Content-Type: application/json  
x-api-key: sua-api-key

Corpo da Requisição

```bash
{
  "cnj": "1234567-12.1234.1.12.1234"
}
```

Resposta de Sucesso

```bash
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "RECEIVED",
  "message": "CNJ received for processing"
}
```

### Implementação Conceitual

Esta solução é uma implementação conceitual completa. Para deploy real:

    Configure uma conta AWS
    Instale e configure AWS CLI
    Siga as instruções de deploy acima
