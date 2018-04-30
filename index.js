'use strict'

const express = require('express'),
      cors = require('cors'),
      graphqlHTTP = require('express-graphql'),
      { makeExecutableSchema } = require('graphql-tools')

const Schema = `
  type Recipient {
    id: ID!
    name: String
    address: String!
    queue: [String]!
  }
  type User {
    id: ID!
    username: String!
    recipients: [Recipient]!
  }

  type Query {
    getUserInfo(id: ID!): User
    getRecipientInfo(id: ID!): Recipient
  }

  type Mutation {
    addNoteToQueue(recipientId: ID!, note: String!): Recipient
  }

  schema {
    query: Query
    mutation: Mutation
  }
`

const testDB = {
  users: {
    0: {
      username: 'kenbellows',
      recipients: [0]
    }
  },
  recipients: {
    0: {
      address: 'someone@example.com',
      name: 'Someone Jones',
      queue: []
    }
  }
}

const Resolvers = {
  Query: {
    getUserInfo(_, {id}){
      return {id, ...testDB.users[id]}
    },
    getRecipientInfo(_, {id}) {
      return getRecipient(id)
    }
  },
  Mutation: {
    addNoteToQueue(_, {recipientId, note}) {
      const recipient = getRecipient(recipientId)
      recipient.queue.push(note)
      return recipient
    }
  },
  User: {
    recipients(user) {
      return user.recipients.map(getRecipient)
    }
  }
}

function getRecipient(id) {
  return {id, ...testDB.recipients[id]}
}

const GRAPHQL_PORT = 3000;
const graphQLServer = express();

const executableSchema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers,
})

graphQLServer
  .use(cors())
  .use('/graphql', graphqlHTTP({
    schema: executableSchema,
    graphiql: true
  }))
  .use('/static', express.static('static'))

graphQLServer.listen(GRAPHQL_PORT)

console.log(`Running a GraphQL API server at localhost:${GRAPHQL_PORT}/graphql`)
