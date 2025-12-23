# Módulo de Leads em Tempo Real

## Visão Geral
Este módulo permite o gerenciamento de leads em tempo real, incluindo visualização, filtragem, e notificação instantânea via WebSocket.

## Estrutura do Banco de Dados
Novas tabelas foram adicionadas ao Prisma Schema:

### Lead
- `id`: UUID
- `email`: String (Indexado)
- `name`: String?
- `phone`: String?
- `status`: Enum (NEW, CONTACTED, QUALIFIED, CONVERTED, LOST)
- `source`: String?
- `userId`: Relation to User
- `interactions`: Relation to Interaction

### Interaction
- `id`: UUID
- `leadId`: Relation to Lead
- `type`: String (EMAIL, CALL, MEETING, NOTE)
- `notes`: String?
- `date`: DateTime

## API Endpoints

### `GET /api/leads`
Retorna a lista de leads do usuário autenticado.
- **Query Params**:
  - `status`: Filtro por status (opcional)
  - `startDate`: Data inicial (opcional)
  - `endDate`: Data final (opcional)
- **Response**: `{ leads: [], stats: {} }`

### `POST /api/leads`
Cria um novo lead.
- **Body**: `{ email, name, phone, source }`
- **Events**: Emite evento WebSocket `new_lead`

### `PATCH /api/leads/:id/status`
Atualiza o status de um lead.
- **Body**: `{ status: "NEW" | "CONTACTED" | ... }`

## WebSocket Events
O frontend deve ouvir o evento `new_lead` para atualizações em tempo real.

```javascript
socket.on('new_lead', (lead) => {
  console.log('Novo lead:', lead);
});
```

## Instalação
1. Execute `npx prisma db push` para atualizar o banco de dados.
2. Reinicie o servidor backend.

## Segurança
Todos os endpoints são protegidos pelo middleware `authenticateToken`.
Os dados são isolados por `userId`.
