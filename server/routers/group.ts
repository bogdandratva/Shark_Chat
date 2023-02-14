import prisma from "@/prisma/client";
import { z } from "zod";
import cloudinary from "../cloudinary";
import { protectedProcedure, router } from "../trpc";

const imageSchema = z.string({
    description: "Base64 format file",
});

const createGroupSchema = z.object({
    name: z.string().min(1).max(100),
    /**
     * Base64 file
     */
    icon: imageSchema.optional(),
});

export const groupRouter = router({
    create: protectedProcedure
        .input(createGroupSchema)
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session!!.user.id;

            let result = await prisma.group.create({
                data: {
                    name: input.name,
                    owner_id: userId,
                    members: {
                        create: {
                            user_id: userId,
                        },
                    },
                },
            });

            if (input.icon != null) {
                const res = await cloudinary.uploader.upload(input.icon, {
                    public_id: `icons/${result.id}`,
                    resource_type: "image",
                    transformation: {
                        width: 300,
                        height: 300,
                        crop: "pad",
                        audio_codec: "none",
                    },
                });

                result = await prisma.group.update({
                    where: {
                        id: result.id,
                    },
                    data: {
                        icon_hash: res.version,
                    },
                });
            }

            return result;
        }),
    all: protectedProcedure.query(async ({ ctx }) => {
        return await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        user_id: ctx.session!!.user.id,
                    },
                },
            },
        });
    }),
});