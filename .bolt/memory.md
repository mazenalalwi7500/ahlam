# Project memory

## Product intent & audience

- Interactive digital envelope (Vite + React) that opens to reveal a warm "Blessed Friday" message
- Recipient: Ahlam (أحلام); content is in Arabic, RTL
- Personal, intimate gift-style experience — not a generic template

## Brand personality & voice

- Warm, poetic, affectionate Arabic tone
- Uses elevated romantic imagery (dew, sky, nature, beauty)
- Directly addresses the recipient with tender forms ("يا أرقّ كائن", "ألطف أحلام")

## Visual design & UX direction

- Elegant aesthetic: envelope with heart and roses motifs
- Professional opening animation reveals the letter
- Touch-activated background music (user-initiated playback)
- RTL layout throughout; Arabic typography must be prioritized
- Flower emojis (🌿🌷) are part of the content design

## Decisions, constraints & rationale

- Message text is user-supplied Arabic prose; preserve exact wording unless user confirms corrections
- Applied two minor linguistic fixes ("الذي" → "التي" for feminine agreement; "أبها" → "أبهى" meaning "most beautiful") — flagged to user for confirmation
- Removed the line about people around her per user request
- Replaced the "كل جمعة هي فرصة جديدة" paragraph with the "لو كان للجمال عنوان" passage
- Closing line changed to "إلى مختوم بقطرات ندى لأجل ألطف أحلام 🌿🌷"

## Open questions & assumptions

- User has not confirmed whether the two wording fixes were intentional or should be reverted
- Assumption: project is single-page, no routing or backend needed
- Assumption: background music asset is provided or will be added by user