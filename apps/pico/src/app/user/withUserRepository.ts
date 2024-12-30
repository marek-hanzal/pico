import { withRepository } from "@use-pico/client";
import { pwd, type Database } from "@use-pico/common";
import { UserSchema } from "~/app/user/UserSchema";

export namespace withUserRepository {
	export interface Props {
		database: Database.Instance;
	}

	export type Instance = ReturnType<typeof withUserRepository>;
}

export const withUserRepository = ({ database }: withUserRepository.Props) => {
	return withRepository({
		name: "UserRepository",
		schema: UserSchema,
		database,
		meta: {
			where: {
				login: "user.login",
				password: "user.password",
			},
		},
		insert() {
			return database.kysely.insertInto("User");
		},
		update() {
			return database.kysely.updateTable("User");
		},
		select() {
			return database.kysely.selectFrom("User as user");
		},
		async toCreate({ shape: { password, ...shape } }) {
			return {
				...shape,
				password: pwd.hash(password),
			};
		},
		async toPatch({ shape }) {
			return shape;
		},
	});
};