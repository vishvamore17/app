import { Client, Account,Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('681b300f0018fdc27bdd');

export const account = new Account(client);
export const databases = new Databases(client);
