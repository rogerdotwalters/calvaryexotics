/**
 * ui/download.js
 * Purpose: hand a text file to the player to keep.
 * Inputs:  saveTextFile(filename, text)
 * Outputs: resolves 'saved' | 'declined'; rejects if no method worked.
 * Notes:   inside the published Claude page, the `downloads` capability is
 *          used (it asks the player to confirm). Anywhere else (a normal
 *          website) a regular browser download is used.
 */
export async function saveTextFile(filename, text) {
  try {
    const downloads = await window.claude?.use?.('downloads');
    if (downloads) {
      await downloads.save({ filename, data: text });
      return 'saved';
    }
  } catch (error) {
    if (error?.code === 'declined') return 'declined';
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'saved';
}
