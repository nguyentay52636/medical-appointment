
import useFetch from '../hook/useFetch';
import UserService from '../service/patientService';

export default function UserList() {
    // 1. Dùng custom hook để fetch data
    const { data: users, isLoading, error, refetch } = useFetch(UserService.getFakeUsers);

    // 2. Function to handle deletion 
    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // A mutation (CREATE, UPDATE, DELETE) is handled outside of the useFetch hook
                await UserService.deleteFakeUser(userId);
                alert(`User ${userId} deleted successfully!`);
                
                // 3. IMPORTANT: tải lại COMPONENT để fetch data mới
                refetch();
            } catch (err) {
                alert(`Error deleting user: ${err.message}`);
            }
        }
    };

    if (isLoading) return <div className='font-bold text-3xl'>Make sure to run "npm run db" before use this page . <i className='font-normal '>Loading users...</i></div>;
    if (error) return <div className='font-bold text-3xl'>Make sure to run "npm run db" before use this page.  Error: {error}</div>;
    if (!users || users.length === 0) return <div className='font-bold text-3xl'>Make sure to run "npm run db" before use this page.
    / or no users found.
    <button className='font-normal bg-teal-400 ' onClick={refetch}>Try Again</button></div>;

    return (
        <div>
            <h2>User List</h2>
            <button onClick={refetch} style={{ marginBottom: '10px' }}>
                Refresh Users
            </button>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name} ({user.email})
                        <button 
                            onClick={() => handleDelete(user.id)}
                            className='ml-1 p-1 bg-amber-500'
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
