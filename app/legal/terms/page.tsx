import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-bold text-abyssal mb-8">
            Conditions Générales d'Utilisation
          </h1>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">1. Objet</h2>
              <p className="text-gray-700 mb-4">
                Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de la plateforme Arqane Vision, ainsi que les droits et obligations des parties dans ce cadre.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">2. Accès à la plateforme</h2>
              <p className="text-gray-700 mb-4">
                La plateforme est accessible gratuitement à tout utilisateur disposant d'un accès à Internet. Tous les frais supportés par l'utilisateur pour accéder au service (matériel informatique, logiciels, connexion Internet, etc.) sont à sa charge.
              </p>
              <p className="text-gray-700 mb-4">
                L'inscription sur la plateforme est réservée aux professionnels opticiens. Chaque inscription est soumise à validation par l'administrateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">3. Inscription et compte utilisateur</h2>
              <p className="text-gray-700 mb-4">
                Pour utiliser les services de la plateforme, l'opticien doit créer un compte en fournissant des informations exactes et à jour. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.
              </p>
              <p className="text-gray-700 mb-4">
                L'utilisateur s'engage à :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Fournir des informations exactes lors de son inscription</li>
                <li>Maintenir ses informations à jour</li>
                <li>Ne pas partager ses identifiants avec des tiers</li>
                <li>Informer immédiatement Arqane Vision en cas d'utilisation non autorisée</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">4. Services proposés</h2>
              <p className="text-gray-700 mb-4">
                La plateforme permet aux opticiens de :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Consulter le catalogue de produits optiques</li>
                <li>Passer des commandes de produits</li>
                <li>Gérer leur panier et leurs commandes</li>
                <li>Recevoir des notifications sur leurs commandes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">5. Commandes</h2>
              <p className="text-gray-700 mb-4">
                Les commandes passées sur la plateforme sont soumises à validation par l'administrateur. Arqane Vision se réserve le droit d'accepter ou de refuser toute commande pour un motif légitime.
              </p>
              <p className="text-gray-700 mb-4">
                Une fois validée, la commande est confirmée par email et/ou WhatsApp.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">6. Prix et paiement</h2>
              <p className="text-gray-700 mb-4">
                Les prix sont indiqués en MAD (Dirham Marocain) et peuvent être modifiés à tout moment. Les prix applicables sont ceux en vigueur au moment de la validation de la commande.
              </p>
              <p className="text-gray-700 mb-4">
                Les modalités de paiement sont définies avec chaque opticien lors de la validation du compte.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">7. Données personnelles</h2>
              <p className="text-gray-700 mb-4">
                Les informations collectées lors de l'inscription et de l'utilisation de la plateforme font l'objet d'un traitement informatique destiné à la gestion des comptes utilisateurs et des commandes.
              </p>
              <p className="text-gray-700 mb-4">
                Conformément à la loi n°09-08, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">8. Propriété intellectuelle</h2>
              <p className="text-gray-700 mb-4">
                Tous les éléments de la plateforme (textes, images, logos, etc.) sont protégés par le droit d'auteur. Toute reproduction ou représentation, totale ou partielle, est interdite sans autorisation préalable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">9. Responsabilité</h2>
              <p className="text-gray-700 mb-4">
                Arqane Vision met tout en œuvre pour assurer la disponibilité et la sécurité de la plateforme, mais ne peut garantir un accès ininterrompu.
              </p>
              <p className="text-gray-700 mb-4">
                Arqane Vision ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation de la plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">10. Modification des CGU</h2>
              <p className="text-gray-700 mb-4">
                Arqane Vision se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification par email ou via la plateforme.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-abyssal mb-4">11. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant ces CGU, vous pouvez nous contacter :
              </p>
              <ul className="list-none text-gray-700 mb-4">
                <li className="mb-2"><strong>Email :</strong> arqanevision@gmail.com</li>
                <li className="mb-2"><strong>Téléphone :</strong> +212 657 435 204</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Dernière mise à jour : 27 novembre 2025
            </p>
            <div className="mt-4 text-center">
              <Link href="/" className="text-blue-fantastic hover:text-burning-flame">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
