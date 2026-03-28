/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Ton lien de connexion pour {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔑 Connexion à ton espace KPB Recours Premium</Heading>
        <Text style={text}>Bonjour,</Text>
        <Text style={text}>
          Tu as demandé à te connecter à ton espace <strong>{siteName}</strong>. Voici comment faire :
        </Text>
        <Text style={stepText}>
          <strong>Étape 1 :</strong> Clique sur le bouton ci-dessous
        </Text>
        <Text style={stepText}>
          <strong>Étape 2 :</strong> Tu seras redirigé(e) vers ton tableau de bord premium
        </Text>
        <Text style={stepText}>
          <strong>Étape 3 :</strong> Tu peux commencer à rédiger ta lettre de recours !
        </Text>
        <Button style={button} href={confirmationUrl}>
          Me connecter maintenant
        </Button>
        <Text style={warning}>
          ⏳ Ce lien expire dans quelques minutes. Si tu n'as pas demandé ce lien, ignore simplement cet email.
        </Text>
        <Text style={footer}>— L'équipe KPB Recours Premium</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(220, 25%, 12%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: 'hsl(220, 10%, 46%)',
  lineHeight: '1.5',
  margin: '0 0 15px',
}
const stepText = {
  fontSize: '14px',
  color: 'hsl(220, 25%, 12%)',
  lineHeight: '1.5',
  margin: '0 0 8px',
  paddingLeft: '10px',
}
const button = {
  backgroundColor: 'hsl(24, 80%, 50%)',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '0.75rem',
  padding: '12px 24px',
  textDecoration: 'none',
  margin: '15px 0',
}
const warning = {
  fontSize: '13px',
  color: 'hsl(220, 10%, 46%)',
  lineHeight: '1.5',
  margin: '20px 0 25px',
  fontStyle: 'italic' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
