import Layout from '../components/layout/Layout';

const ManageCustomerPage = () => {
  const email = sessionStorage.getItem('email');  

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full mx-auto mt-10">
          <p className="text-lg text-center text-gray-700">

          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ManageCustomerPage;