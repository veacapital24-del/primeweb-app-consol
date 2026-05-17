-- Expand order fulfilment statuses (pending → completed pipeline).

update orders set status = 'completed' where status = 'fulfilled';

alter table orders drop constraint if exists orders_status_check;

alter table orders
  add constraint orders_status_check check (
    status in (
      'pending',
      'confirmed',
      'packing',
      'packed',
      'delivery_in_progress',
      'delivered',
      'completed',
      'cancelled'
    )
  );
