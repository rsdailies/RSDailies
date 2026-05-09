import React, { useState, useEffect } from 'react';
import * as StorageService from '../../lib/shared/storage/storage-service';
import { StorageKeyBuilder } from '../../lib/shared/storage/keys-builder';

interface Props {
  id: string;
  name: string;
  wiki?: string;
  note?: string;
  sectionKey: string;
}

export const TrackerRow: React.FC<Props> = ({ id, name, wiki, note, sectionKey }) => {
  const [completed, setCompleted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // 1:1 Storage Key Sync
    const compKey = StorageKeyBuilder.taskCompletion(sectionKey, id);
    const pinKey = StorageKeyBuilder.overviewPins();
    const hideKey = StorageKeyBuilder.taskHidden(sectionKey, id);

    setCompleted(!!StorageService.load(compKey, false));
    
    const pins = StorageService.load(pinKey, {});
    setPinned(!!pins[id]);

    setHidden(!!StorageService.load(hideKey, false));
  }, [id, sectionKey]);

  const toggleComplete = () => {
    const next = !completed;
    setCompleted(next);
    StorageService.save(StorageKeyBuilder.taskCompletion(sectionKey, id), next);
    // Trigger reset orchestrator check if needed or just heartbeat handles it
  };

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !pinned;
    setPinned(next);
    const pins = StorageService.load(StorageKeyBuilder.overviewPins(), {});
    if (next) pins[id] = true;
    else delete pins[id];
    StorageService.save(StorageKeyBuilder.overviewPins(), pins);
  };

  const toggleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHidden(true);
    StorageService.save(StorageKeyBuilder.taskHidden(sectionKey, id), true);
  };

  if (hidden) return null;

  return (
    <tr data-completed={completed ? "true" : "false"} onClick={toggleComplete}>
      <td className="activity_name">
        <a 
          href={wiki ? `https://runescape.wiki/w/${wiki}` : "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {name}
        </a>
        <div className="row-actions">
          <button 
            type="button" 
            className="pin-button btn btn-secondary btn-sm active" 
            title="Pin to Overview"
            onClick={togglePin}
          >
            {pinned ? '★' : '☆'}
          </button>
          <button 
            className="hide-button btn btn-danger btn-sm active" 
            title="Hide row"
            onClick={toggleHide}
          >
            &times;
          </button>
        </div>
      </td>
      <td className="activity_notes">
        <span className="activity_desc">{note || '\u00A0'}</span>
      </td>
      <td className="activity_status">
        <span className="activity_check_off">&#9744;</span>
        <span className="activity_check_on">&#9745;</span>
      </td>
    </tr>
  );
};
