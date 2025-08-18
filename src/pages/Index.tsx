
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  return (
    <Layout title="Dashboard">
      <Dashboard phoneNumber={""} />
    </Layout>
  );
};

export default Index;
