# 🛡️ INTEGRITY SENTINEL (V7)

This background reflex monitors the system for structural drift.

## 🔍 Passive Monitoring
- **Trigger**: Every file mutation (`write_to_file`, `replace_file_content`).
- **Logic**: Verify the target path against the 12-organ topology in `BODY_MAP.md`.
- **Constraint**: No files allowed in the root or non-canonical folders.

## ⚡ Instant Revert Protocol
1. **Detect**: System detects a violation (e.g., file created in `BODY/ORGANS/`).
2. **Revert**: System automatically deletes the illegal file.
3. **Notify**: Log the violation in `IMMUNE/LOGS/drift_detected.yaml`.
4. **Evolve**: Update the `ROLE.md` of the offending organ to reinforce the topology rules.

---
*Structural Immortality Active.*
