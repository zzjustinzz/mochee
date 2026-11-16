import { Cupcake } from './Bakery';
import { Icon } from './Decor';
import VenueMap from './VenueMap';
import { links, site } from '@/lib/site';

/** Phiếu hẹn: thời gian, địa điểm, chỉ đường và bản đồ. */
export default function PartyInfo() {
  return (
    <section className="card ticket" id="tiec" aria-labelledby="tiec-title">
      <Cupcake className="card__sticker" />
      <p className="eyebrow">Phiếu hẹn</p>
      <h2 id="tiec-title" className="card__title">
        Tiệc sinh nhật bé {site.babyName}
      </h2>

      <div className="ticket__body">
      <div className="ticket__info">

      <dl className="ticket__rows">
        <div className="ticket__row">
          <dt>
            <Icon name="clock" />
            <span className="visually-hidden">Thời gian</span>
          </dt>
          <dd>
            <strong className="ticket__big">{site.partyTimeLabel}</strong>
            <span>{site.partyDateLabel}</span>
          </dd>
        </div>
        <div className="ticket__row">
          <dt>
            <Icon name="pin" />
            <span className="visually-hidden">Địa điểm</span>
          </dt>
          <dd>
            <strong className="ticket__big ticket__big--venue">{site.venue.name}</strong>
            <span className="chip">{site.venue.hall}</span>
            <span>{site.venue.address}</span>
          </dd>
        </div>
      </dl>

      <div className="ticket__actions">
        <a className="btn btn--primary" href={links.directions} target="_blank" rel="noopener noreferrer">
          <Icon name="route" /> Chỉ đường
        </a>
        <a className="btn btn--ghost" href={links.googleCalendar} target="_blank" rel="noopener noreferrer">
          <Icon name="calendar" /> Thêm vào lịch
        </a>
      </div>
      <p className="ticket__ics">
        Dùng lịch iPhone / Outlook? <a href={links.ics}>Tải file lịch (.ics)</a>
      </p>

      </div>

      <VenueMap />
      </div>
    </section>
  );
}
