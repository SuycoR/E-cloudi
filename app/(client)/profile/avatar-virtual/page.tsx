import VirtualAvatarWizard from "@/app/components/profile/VirtualAvatarWizard";

const AvatarVirtualPage = () => {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-ebony-600">Avatar virtual</p>
        <h1 className="text-3xl font-semibold text-ebony-900">
          Diseña tu avatar en minutos
        </h1>
        <p className="text-sm text-gray-500">
          Sigue la guía paso a paso para subir tu foto, completar tu información
          y recibir recomendaciones de colorimetría para el probador virtual.
        </p>
      </div>

      <VirtualAvatarWizard />
    </section>
  );
};

export default AvatarVirtualPage;
