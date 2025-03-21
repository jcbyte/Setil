import { useToast } from "@/components/ui/toast";
import { cleanupInvites, invite } from "@/firebase/firestore";

export async function inviteUser(groupId: string, groupName: string) {
	// Cleanup old invites
	await cleanupInvites(groupId);

	// Create invite
	const inviteCode = await invite(groupId, 3 * 24 * 60 * 60 * 1000);
	const inviteLink = `${window.location.origin}/invite/${groupId}/${inviteCode}`;
	const sharedData = {
		title: "Setil Invite Link",
		text: `Join my Setil Group, ${groupName}! This link will be valid for 3 days.`,
		url: inviteLink,
	};

	// If this can be shared then share it
	if (navigator.canShare(sharedData)) {
		await navigator.share(sharedData);
	} else {
		const { toast } = useToast();

		// Else copy to clipboard and display a confirmation
		await navigator.clipboard.writeText(inviteLink).then(() => {
			toast({
				title: "Copied invite link to Clipboard",
				description: "Link will be valid for 3 days.",
				duration: 5000,
			});
		});
	}
}
