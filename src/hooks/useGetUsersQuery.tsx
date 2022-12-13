import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from './useAuth';

import type { AxiosRequestConfig } from 'axios';
import type { AuthClient } from 'providers';

const { VITE_BASE_API_URL: apiUrl = `${window.location.origin}/api` } =
	import.meta.env;

export const useGetUsersQuery = (onSuccess?: Function) => {
	try {
		const { authClient } = useAuth();

		const getUsersFn = async () => {
			if (await authClient.isAuthenticated()) {
				const options: AxiosRequestConfig = {
					method: 'GET',
					url: `${apiUrl}/users`,
					headers: {
						authorization: `Bearer ${authClient.getAccessToken()}`,
					},
				};

				const { data = [] } = (await axios(options)) as {
					data: User[];
				};

				const { sub } = await authClient.getUser();

				console.log(data);

				return data.filter((user) => {
					if (user?.user_id !== sub) {
						return user;
					}
				});
			}
		};

		return useQuery({
			queryKey: ['users'],
			queryFn: getUsersFn,
			onSuccess: (data) => {
				if (onSuccess) {
					onSuccess(data || []);
				}
			},
		});
	} catch (error) {
		console.error(error);
		throw new Error('useGetUsersQuery init error');
	}
};
