import { zodResolver } from "@hookform/resolvers/zod";
import {
    Button,
    FormCss,
    FormError,
    FormInput,
    ModalContext,
    onSubmit,
    Tx,
    type Form,
} from "@use-pico/client";
import { useContext, type FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { BuildingIcon } from "~/app/derivean/icon/BuildingIcon";
import { BuildingBasePopupSelect } from "~/app/derivean/root/building/base/BuildingBasePopupSelect";
import { BuildingSchema } from "~/app/derivean/schema/building/Building_Schema";

export namespace BuildingForm {
	export interface Props extends Form.Props<BuildingSchema["shape"]> {
		//
	}
}

export const BuildingForm: FC<BuildingForm.Props> = ({
	mutation,
	defaultValues,
	variant,
	tva = FormCss,
	css,
}) => {
	const form = useForm<BuildingSchema["~shape"]>({
		resolver: zodResolver(BuildingSchema.shape),
		defaultValues: {
			level: 1,
			...defaultValues,
		},
	});
	const modalContext = useContext(ModalContext);

	const tv = tva({
		...variant,
		isLoading: form.formState.isLoading,
		isSubmitting: form.formState.isSubmitting,
		css,
	}).slots;

	return (
		<form
			className={tv.base()}
			onSubmit={onSubmit<BuildingSchema["shape"]>({
				form,
				mutation,
			})}
		>
			<FormError
				variant={{ highlight: true }}
				error={form.formState.errors.root}
			/>

			<FormInput
				formState={form.formState}
				name={"buildingBaseId"}
				label={<Tx label={"Select building base (label)"} />}
			>
				<Controller
					control={form.control}
					name={"buildingBaseId"}
					render={({ field: { ref: _, ...field } }) => {
						return (
							<BuildingBasePopupSelect
								allowEmpty
								{...field}
							/>
						);
					}}
				/>
			</FormInput>

			<FormInput
				formState={form.formState}
				name={"buildingBaseId"}
				label={<Tx label={"Select building base (label)"} />}
			>
				<input
					type={"number"}
					{...form.register("level")}
				/>
			</FormInput>

			<div className={"flex flex-row justify-between gap-8"}>
				<Button
					iconEnabled={BuildingIcon}
					type={"submit"}
				>
					<Tx label={"Save (submit)"} />
				</Button>
			</div>
		</form>
	);
};
